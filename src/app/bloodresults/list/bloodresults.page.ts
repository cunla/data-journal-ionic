import {Component, OnInit} from '@angular/core';
import {BioResult, BioService, EMPTY_RESULT} from '../bio.service';
import {ModalController} from '@ionic/angular';
import {StateProvider} from '../../common/state.provider';
import {EditBioresultComponent} from '../edit/edit-bioresult.component';
import * as moment from 'moment';

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
    this.segmentChanged(null);
  }

  segmentChanged(groupby: CustomEvent) {
    this.groupby = groupby?.detail?.value || 'date';
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
    });
  }

  async presentModal(bioresult: BioResult) {
    if (this.state.modalOpen) {
      return;
    }
    this.state.modalOpen = true;
    const modal = await this.modalController.create({
      component: EditBioresultComponent,
      componentProps: {bioresult,}
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
}
