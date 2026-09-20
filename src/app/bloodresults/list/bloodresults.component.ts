import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {BioResult, BioService, EMPTY_RESULT} from '../bio.service';
import {ModalController, RefresherCustomEvent, SegmentCustomEvent} from '@ionic/angular/lazy';
import {StateProvider} from '../../common/state.provider';
import {EditBioresultComponent} from '../edit/edit-bioresult.component';
import {AddBioresultComponent} from "../add/add-bioresult.component";
import {BioMetadataService} from "../bio-metadata.service";
import {DateTime} from "luxon";

@Component({
    selector: 'app-bloodresults',
    templateUrl: './bloodresults.component.html',
    styleUrls: ['./bloodresults.component.scss'],
    standalone: false
})
export class BloodresultsComponent implements OnInit, OnDestroy {
  data: Map<string, BioResult[]> = new Map<string, BioResult[]>();
  groupby = 'date';
  newResult = EMPTY_RESULT;
  headers: string[] = [];
  graphOrListMap = new Map<string, string>();
  private allResults: BioResult[] = [];
  private readonly destroy$ = new Subject<void>();

  constructor(private modalController: ModalController,
              private state: StateProvider,
              private bioMetadataService: BioMetadataService,
              private bioService: BioService) {
  }

  private static transform(date: Date) {
    return DateTime.fromJSDate(date).toFormat('yyyy-MM-dd EEEE\t');
  }

  ngOnInit() {
    this.bioService.data.pipe(takeUntil(this.destroy$)).subscribe((allResults) => {
      this.allResults = allResults;
      this.regroup();
    });
    // Reference ranges load asynchronously; regroup once they are available
    this.bioMetadataService.loaded$.pipe(takeUntil(this.destroy$)).subscribe(() => this.regroup());
    this.bioService.refresh();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  segmentChanged(groupby: CustomEvent) {
    this.groupby = groupby?.detail?.value || this.groupby;
    this.regroup();
  }

  graphOrList(header: string, $event: SegmentCustomEvent) {
    this.graphOrListMap[header] = $event?.detail?.value || 'list';
  }

  async presentAddModal(item: BioResult) {
    if (this.state.modalOpen) {
      return;
    }
    this.state.modalOpen = true;
    const modal = await this.modalController.create({
      component: AddBioresultComponent,
      componentProps: {bioresult: item,}
    });
    // Clear the flag however the modal is closed, including backdrop/Esc/back
    modal.onDidDismiss().then(() => this.state.modalOpen = false);
    return await modal.present();
  }

  delete(item: BioResult) {
    this.bioService.delete(item.id).then(() => {
      console.log(`Deleted ${item.id}`);
    });
  }

  async presentEditModal(item: BioResult) {
    if (this.state.modalOpen) {
      return;
    }
    this.state.modalOpen = true;
    const modal = await this.modalController.create({
      component: EditBioresultComponent,
      componentProps: {bioresult: item,}
    });
    // Clear the flag however the modal is closed, including backdrop/Esc/back
    modal.onDidDismiss().then(() => this.state.modalOpen = false);
    return await modal.present();
  }

  doRefresh(event: RefresherCustomEvent) {
    this.bioService.refresh();
    event?.target.complete();
  }

  itemBadgeColor(item: BioResult) {
    const metadata = item.metadata || this.bioMetadataService.getTestMetaData(item.type);
    if (!metadata) {
      return 'medium';
    }
    return (item.value < metadata.low || item.value > metadata.high) ? 'danger' : 'success';
  }

  // Groups the latest results by date or by test type for display
  private regroup() {
    const sorted = [...this.allResults].sort((a, b) => b.date.getTime() - a.date.getTime());
    this.data = new Map<string, BioResult[]>();
    this.headers = [];
    sorted.forEach((res: BioResult) => {
      res.metadata = this.bioMetadataService.getTestMetaData(res.type);
      const group = (this.groupby === 'date') ? BloodresultsComponent.transform(res.date) : res.type;
      if (!this.data.has(group)) {
        this.data.set(group, []);
        this.headers.push(group);
      }
      this.data.get(group).push(res);
    });
  }
}
