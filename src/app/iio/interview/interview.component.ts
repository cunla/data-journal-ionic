import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {IioService, InterviewInterface, InterviewStatus} from '../iio.service';
import {AlertController} from '@ionic/angular';
import {DateTime} from 'luxon';


@Component({
  selector: 'app-interview',
  templateUrl: './interview.component.html',
  styleUrls: ['./interview.component.scss'],
})
export class InterviewComponent implements OnInit {
  @Input() interview: InterviewInterface;
  @Output() editClicked = new EventEmitter();
  InterviewStatusTypes = InterviewStatus;
  InterviewStatusIconMap = {
    'Scheduled': {'icon': 'calendar-outline', color: 'dark'},
    'Paid': {'icon': 'logo-paypal', color: 'tertiary'},
    'Done': {'icon': 'checkbox-outline', color: 'success'},
    'Cancelled': {'icon': 'close', color: 'dark'},
    'NoShow': {'icon': 'close-outline', color: 'dark'},
  };
  hideFeedback: boolean = true;

  constructor(public alertController: AlertController,
              private iio: IioService,) {
  }

  ngOnInit() {
  }

  async delete() {
    const plannedDate = DateTime.fromJSDate(new Date(this.interview.plannedDate)).toFormat('yyyy-LLL-dd HH:mm');
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Confirm delete!',
      message: `Are you sure you want to delete interview <strong>${this.interview.type}</strong> ` +
        `with <strong>${this.interview.candidateName}</strong> ` +
        `on <strong>${plannedDate}</strong> `,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (res) => {
            console.log('Confirm Cancel: ', res);
          }
        }, {
          text: 'Delete',
          handler: () => {
            this.iio.delete(this.interview.id).then(
              () => {
                this.iio.refresh();
              }, err => {
                console.log(err);
              });
          }
        }
      ]
    });
    await alert.present();
  }

  updateInterviewStatus(status: InterviewStatus) {
    this.interview.status = status;
    this.interview.paidDate = (status === InterviewStatus.Paid) ? new Date().toString() : null;
    this.iio.update(this.interview.id, this.interview).then(() => {
      const slidingItem = document.getElementById('slidingItem-' + this.interview.id) as any;
      slidingItem.close();
    });
  }

}
