import {Component, OnDestroy, OnInit} from '@angular/core';
import {combineLatest, Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {TripInterface, TripsService} from '../trips/trips.service';
import {AddressInterface, AddressService} from '../addresses/address.service';
import {findGaps, findOverlaps, Gap, Overlap} from './address-history';
import {
  currentHomeCountry,
  rollingWindow,
  summariseByYear,
  WindowSummary,
  YearSummary,
} from './presence';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss'],
  standalone: false
})
export class ReportsComponent implements OnInit, OnDestroy {
  readonly windowOptions = [1, 2, 3, 5, 10];
  windowYears = 5;
  homeCountry: string | null = null;
  countries: string[] = [];
  window: WindowSummary | null = null;
  years: YearSummary[] = [];
  expandedYear: number | null = null;
  gaps: Gap[] = [];
  overlaps: Overlap[] = [];
  addressCount = 0;

  private trips: TripInterface[] = [];
  private addresses: AddressInterface[] = [];
  private homeCountryPinned = false;
  private readonly destroy$ = new Subject<void>();

  constructor(private tripsService: TripsService,
              private addressService: AddressService) {
  }

  ngOnInit() {
    combineLatest([this.tripsService.data, this.addressService.data])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([trips, addresses]) => {
        this.trips = trips;
        this.addresses = addresses;
        if (!this.homeCountryPinned) {
          this.homeCountry = currentHomeCountry(addresses);
        }
        this.countries = [...new Set([
          ...addresses.map(a => a.country),
          ...trips.map(t => t.country),
        ].filter(country => !!country))].sort();
        this.recalculate();
      });
    this.tripsService.refresh();
    this.addressService.refresh();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setWindowYears(event: CustomEvent) {
    this.windowYears = event?.detail?.value ?? this.windowYears;
    this.recalculate();
  }

  setHomeCountry(event: CustomEvent) {
    this.homeCountry = event?.detail?.value ?? null;
    this.homeCountryPinned = true;
    this.recalculate();
  }

  toggleYear(year: number) {
    this.expandedYear = this.expandedYear === year ? null : year;
  }

  private recalculate() {
    this.window = rollingWindow(this.trips, this.homeCountry, this.windowYears);
    this.years = summariseByYear(this.trips, this.homeCountry);
    this.addressCount = this.addresses.length;
    this.gaps = findGaps(this.addresses);
    this.overlaps = findOverlaps(this.addresses);
  }
}
