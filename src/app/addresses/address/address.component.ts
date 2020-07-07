import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {AddressInterface, AddressService} from '../address.service';
import {Dates} from '../../common/dates';
import {AlertController} from '@ionic/angular';

@Component({
  selector: 'app-address',
  templateUrl: './address.component.html',
  styleUrls: ['./address.component.scss']
})
export class AddressComponent implements OnInit {
  @Input() address: AddressInterface;
  @Output() editClicked = new EventEmitter();
  daysDiff = Dates.daysDiffFunc;

  constructor(
    public alertController: AlertController,
    private addressService: AddressService) {
  }


  ngOnInit() {
  }

  async delete() {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Confirm delete!',
      message: `Are you sure you want to delete address at <strong>${this.address.city}</strong> ` +
        `between <strong>${this.address.start.toDateString()}</strong> ` +
        `and <strong>${this.address.end?.toDateString()}</strong>`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            console.log('Confirm Cancel: blah');
          }
        }, {
          text: 'Delete',
          handler: () => {
            this.addressService.delete(this.address.id).then(
              () => {
                this.addressService.refresh();
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
