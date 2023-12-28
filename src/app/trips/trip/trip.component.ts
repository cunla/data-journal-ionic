import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {TripInterface, TripsService} from '../trips.service';
import {Dates} from '../../common/dates';
import {AlertController} from '@ionic/angular';

@Component({
  selector: 'app-trip',
  templateUrl: './trip.component.html',
  styleUrls: ['./trip.component.scss']
})
export class TripComponent implements OnInit {
  @Input() trip: TripInterface;
  @Output() editClicked = new EventEmitter();
  daysDiff = Dates.daysDiffFunc;

  constructor(
    public alertController: AlertController,
    private trips: TripsService) {
  }


  async delete() {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Confirm delete!',
      message: `Are you sure you want to delete trip to <strong>${this.trip.city}</strong> ` +
        `between <strong>${this.trip.start.toDateString()}</strong> ` +
        `and <strong>${this.trip.end?.toDateString()}</strong>`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel: blah');
          }
        }, {
          text: 'Delete',
          handler: () => {
            this.trips.delete(this.trip.id).then(
              () => {
                this.trips.refresh();
              }, err => {
                console.log(err);
              });
          }
        }
      ]
    });

    await alert.present();

  }
}
