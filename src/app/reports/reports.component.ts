import {Component, OnDestroy, OnInit} from '@angular/core';
import {combineLatest, Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {saveAs} from 'file-saver';
import {TripInterface, TripsService} from '../trips/trips.service';
import {AddressInterface, AddressService} from '../addresses/address.service';
import {BioResult, BioService} from '../bloodresults/bio.service';
import {CsvTools} from '../common/csvtools.service';
import {backupFilename, buildBackup, rangeFilename, tripsInRange} from './export';
import {findGaps, findOverlaps, Gap, Overlap} from './address-history';
import {rollingWindow, summariseByYear, WindowSummary, YearSummary} from './presence';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss'],
  standalone: false
})
export class ReportsComponent implements OnInit, OnDestroy {
  readonly windowOptions = [1, 2, 3, 5, 10];
  windowYears = 5;
  window: WindowSummary | null = null;
  years: YearSummary[] = [];
  expandedYear: number | null = null;
  gaps: Gap[] = [];
  overlaps: Overlap[] = [];
  addressCount = 0;
  // yyyy-MM-dd, as <ion-input type="date"> works in
  rangeFrom = '';
  rangeTo = '';

  private trips: TripInterface[] = [];
  private addresses: AddressInterface[] = [];
  private bioResults: BioResult[] = [];
  private readonly destroy$ = new Subject<void>();

  constructor(private tripsService: TripsService,
              private addressService: AddressService,
              private bioService: BioService) {
  }

  private static asDay(value: string): Date | null {
    if (!value) {
      return null;
    }
    const [year, month, day] = value.split('-').map(Number);
    return year && month && day ? new Date(year, month - 1, day) : null;
  }

  private static asInputValue(date: Date): string {
    const pad = (n: number) => `${n}`.padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  }

  ngOnInit() {
    combineLatest([this.tripsService.data, this.addressService.data])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([trips, addresses]) => {
        this.trips = trips;
        this.addresses = addresses;
        this.recalculate();
      });
    this.bioService.data.pipe(takeUntil(this.destroy$))
      .subscribe(results => this.bioResults = results);
    this.tripsService.refresh();
    this.addressService.refresh();
    this.bioService.refresh();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setWindowYears(event: CustomEvent) {
    this.windowYears = event?.detail?.value ?? this.windowYears;
    this.recalculate();
  }

  // Exports the trips touching the chosen range, not only those wholly inside it
  exportRangeCsv() {
    const from = ReportsComponent.asDay(this.rangeFrom);
    const to = ReportsComponent.asDay(this.rangeTo);
    if (!from || !to) {
      return;
    }
    const rows = tripsInRange(this.trips, from, to);
    const csv = CsvTools.convertToCsv(rows,
      ['start', 'end', 'locationName', 'city', 'country', 'purpose']);
    saveAs(new Blob([csv], {type: 'text/csv;charset=utf-8'}), rangeFilename(from, to));
  }

  downloadBackup() {
    const backup = buildBackup(this.trips, this.addresses, this.bioResults);
    const json = JSON.stringify(backup, null, 2);
    saveAs(new Blob([json], {type: 'application/json;charset=utf-8'}), backupFilename());
  }

  get rangeIsValid(): boolean {
    const from = ReportsComponent.asDay(this.rangeFrom);
    const to = ReportsComponent.asDay(this.rangeTo);
    return !!from && !!to && from <= to;
  }

  get recordCount(): number {
    return this.trips.length + this.addresses.length + this.bioResults.length;
  }

  toggleYear(year: number) {
    this.expandedYear = this.expandedYear === year ? null : year;
  }

  private recalculate() {
    this.window = rollingWindow(this.trips, this.addresses, this.windowYears);
    if (!this.rangeFrom) {
      this.rangeFrom = ReportsComponent.asInputValue(this.window.from);
      this.rangeTo = ReportsComponent.asInputValue(this.window.to);
    }
    this.years = summariseByYear(this.trips, this.addresses);
    this.addressCount = this.addresses.length;
    this.gaps = findGaps(this.addresses);
    this.overlaps = findOverlaps(this.addresses);
  }
}
