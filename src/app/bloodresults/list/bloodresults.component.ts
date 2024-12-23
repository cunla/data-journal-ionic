import {Component, OnInit} from '@angular/core';
import {BioResult, BioService, EMPTY_RESULT} from '../bio.service';
import {ModalController, RefresherCustomEvent, SegmentCustomEvent} from '@ionic/angular';
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
export class BloodresultsComponent implements OnInit {
  data: Map<string, Array<BioResult>> = new Map<string, Array<BioResult>>();
  groupby = 'date';
  newResult = EMPTY_RESULT;
  headers: string[] = [];
  graphOrListMap: Map<string, string> = new Map();

  constructor(private modalController: ModalController,
              private state: StateProvider,
              private bioMetadataService: BioMetadataService,
              private bioService: BioService) {
  }

  private static transform(date: Date) {
    return DateTime.fromJSDate(date).toFormat('yyyy-MM-dd EEEE\t');
  }

  ngOnInit() {
    this.doRefresh(null);
  }

  segmentChanged(groupby: CustomEvent) {
    this.groupby = groupby?.detail?.value || this.groupby;
    this.doRefresh(null);
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
    modal.present().then(() => {
      this.doRefresh(null);
    });
  }

  delete(item: BioResult) {
    this.bioService.delete(item.id).then(() => {
      console.log(`Deleted ${item.id}`);
      this.doRefresh(null);
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
    return await modal.present();
  }

  doRefresh(event: RefresherCustomEvent) {
    this.bioService.refresh();
    this.bioService.data.subscribe((allResults) => {
      allResults = allResults.sort((a, b) => {
        return b.date.getTime() - a.date.getTime();
      })
      this.data = new Map<string, Array<BioResult>>();
      this.headers = [];
      allResults.forEach((res: BioResult) => {
        res.metadata = this.bioMetadataService.getTestMetaData(res.type);
        const group = (this.groupby === 'date') ? BloodresultsComponent.transform(res.date) : res.type;
        if (!this.data.has(group)) {
          this.data.set(group, []);
          this.headers.push(group);
        }
        this.data.get(group).push(res);
      });
      event?.target.complete();
    });
  }

  itemBadgeColor(item: BioResult) {
    const metadata = item.metadata || this.bioMetadataService.getTestMetaData(item.type);
    return (item.value < metadata.low || item.value > metadata.high) ? 'danger' : 'success';
  }
}
