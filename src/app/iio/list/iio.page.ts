import {Component, OnInit, ViewChild} from '@angular/core';
import {CsvTools} from '../../common/csvtools.service';
import {EMPTY_INTERVIEW, IioService, InterviewInterface, InterviewStatus} from '../iio.service';
import {saveAs} from 'file-saver';
import {StateProvider} from '../../common/state.provider';
import {IonInfiniteScroll, LoadingController, ModalController} from '@ionic/angular';
import {EditInterviewComponent} from '../edit-interview/edit-interview.component';

@Component({
  selector: 'app-iio',
  templateUrl: './iio.page.html',
  styleUrls: ['./iio.page.scss'],
})
export class IioPage implements OnInit {
  newInterview: InterviewInterface = EMPTY_INTERVIEW;
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;


  constructor(public iio: IioService,
              private state: StateProvider,
              private loadingController: LoadingController,
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
        ['plannedDate', 'type', 'candidateName', 'value', 'status', 'paidDate']);
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

  async markAllAsPaid(items: Array<InterviewInterface>) {
    const loading = await this.loadingController.create({
      message: 'Please wait...',
    });
    await loading.present();
    const updates = [];
    for (const item of items) {
      if (item.status == InterviewStatus.Cancelled) {
        continue;
      }
      item.status = InterviewStatus.Paid;
      item.paidDate = new Date().toString();
      updates.push(this.iio.update(item.id, item));
    }
    Promise.all(updates).then(() => {
      loading.dismiss();
    });

  }

  loadMoreData(event: any) {
    this.iio.done.subscribe(res => {
      if (!res) {
        this.iio.more();
        this.infiniteScroll.complete().then();
      } else {
        this.infiniteScroll.disabled = true;
      }
    });
  }
}
