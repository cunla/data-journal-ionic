import {Component} from '@angular/core';
import {take} from 'rxjs/operators';
import {AddressInterface, AddressService, EMPTY_ADDRESS} from '../address.service';
import {CsvTools} from '../../common/csvtools.service';
import {saveAs} from 'file-saver';
import {ModalController} from '@ionic/angular/lazy';
import {EditAddressComponent} from '../edit-address/edit-address.component';
import {StateProvider} from '../../common/state.provider';

@Component({
    selector: 'app-trips',
    templateUrl: './address-list.component.html',
    styleUrls: ['./address-list.component.scss'],
    standalone: false
})
export class AddressListComponent {
  // A fresh copy per click; EMPTY_ADDRESS is shared and must stay untouched
  get newAddress(): AddressInterface {
    return {...EMPTY_ADDRESS};
  }

  constructor(public addressService: AddressService,
              private state: StateProvider,
              public modalController: ModalController,
  ) {
  }

  async presentModal(address: AddressInterface) {
    if (this.state.modalOpen) {
      return;
    }
    this.state.modalOpen = true;
    const modal = await this.modalController.create({
      component: EditAddressComponent,
      componentProps: {address,}
    });
    // Clear the flag however the modal is closed, including backdrop/Esc/back
    modal.onDidDismiss().then(() => this.state.modalOpen = false);
    return await modal.present();
  }

  searchByName(event) {
    this.addressService.search(event.target.value?.toLowerCase());
  }

  exportCsv() {
    this.addressService.data.pipe(take(1)).subscribe(res => {
      const addressesCsv = CsvTools.convertToCsv(res,
        ['start', 'end', 'locationName', 'address']);
      const blob = new Blob([addressesCsv], {type: 'text/csv;charset=utf-8'});
      saveAs(blob, 'addresses.csv');
    });
  }

}
