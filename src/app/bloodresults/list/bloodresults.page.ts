import {Component, OnInit} from '@angular/core';
import {BioResult, BioService, EMPTY_RESULT} from '../bio.service';
import {ModalController} from '@ionic/angular';
import {StateProvider} from '../../common/state.provider';
import * as moment from 'moment';
import {EditBioresultComponent} from '../edit/edit-bioresult.component';

@Component({
  selector: 'app-bloodresults',
  templateUrl: './bloodresults.page.html',
  styleUrls: ['./bloodresults.page.scss'],
})
export class BloodresultsPage implements OnInit {
  data: Map<any, Array<BioResult>> = new Map<string, Array<BioResult>>();
  groupby = 'date';
  newResult = EMPTY_RESULT;
  headers: string[] = [];

  constructor(private modalController: ModalController,
              private state: StateProvider,
              private bioService: BioService) {
  }

  ngOnInit() {
    this.doRefresh(null);
  }

  segmentChanged(groupby: CustomEvent) {
    this.groupby = groupby?.detail?.value || this.groupby;
    this.doRefresh(null);
  }

  async presentModal(item: BioResult) {
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

  delete(item: BioResult) {
    this.bioService.delete(item.id).then(() => {
      this.bioService.refresh();
    });
  }

  private static transform(date: Date) {
    return moment(date).format('YYYY-MM-DD dddd');
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

  doRefresh(event: any) {
    this.bioService.data.subscribe((allResults) => {
      this.data = new Map<string, Array<BioResult>>();
      this.headers = [];
      allResults.forEach((res) => {
        const group = (this.groupby === 'date') ? BloodresultsPage.transform(res.date) : res.type;
        if (!this.data.has(group)) {
          this.data.set(group, []);
          this.headers.push(group);
        }
        this.data.get(group).push(res);
      });
      event?.target.complete();
    });
  }
}
