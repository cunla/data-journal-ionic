import {Component, OnInit} from '@angular/core';
import {CsvTools} from '../../common/csvtools.service';
import {EMPTY_INTERVIEW, IioService, InterviewInterface} from '../iio.service';
import {saveAs} from 'file-saver';
import {StateProvider} from '../../common/state.provider';
import {ModalController} from '@ionic/angular';
import {EditInterviewComponent} from '../edit-interview/edit-interview.component';

@Component({
  selector: 'app-iio',
  templateUrl: './iio.page.html',
  styleUrls: ['./iio.page.scss'],
})
export class IioPage implements OnInit {
  newInterview: InterviewInterface = EMPTY_INTERVIEW;

  constructor(public iio: IioService,
              private state: StateProvider,
              private modalController: ModalController,) {
  }

  ngOnInit() {
    const searchbar = document.querySelector('ion-searchbar');
    searchbar.addEventListener('ionInput', this.searchByName.bind(this));
  }

  private searchByName(event) {
    const query = event.target.value.toLowerCase();
    this.iio.init('iio-data', 'plannedDate', {
      reverse: true, prepend: false, searchValue: query,
    });
  }

  exportCsv() {
    this.iio.data.subscribe(res => {
      const interviewsCsv = CsvTools.convertToCsv(res,
        ['plannedDate', 'type', 'candidateName', 'value', 'done', 'noshow', 'paid', 'paidDate']);
      console.log(interviewsCsv);
      const blob = new Blob([interviewsCsv], {type: 'text/plain;charset=utf-8'});
      saveAs(blob, 'data.csv');
    });
  }

  doRefresh(event: any) {
    this.iio.refresh();
    event?.target.complete();
  }

  async presentModal(interview: InterviewInterface) {
    if (this.state.modalOpen) {
      return;
    }
    this.state.modalOpen = true;
    const modal = await this.modalController.create({
      component: EditInterviewComponent,
      componentProps: {interview,}
    });
    return await modal.present();
  }
}
