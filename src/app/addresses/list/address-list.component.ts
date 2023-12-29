import {Component} from '@angular/core';
import {ADDRESS_HISTORY_PATH, AddressInterface, AddressService, EMPTY_ADDRESS} from '../address.service';
import {CsvTools} from '../../common/csvtools.service';
import {saveAs} from 'file-saver';
import {ModalController} from '@ionic/angular';
import {EditAddressComponent} from '../edit-address/edit-address.component';
import {StateProvider} from '../../common/state.provider';
import {DateTime} from "luxon";

@Component({
  selector: 'app-trips',
  templateUrl: './address-list.component.html',
  styleUrls: ['./address-list.component.scss']
})
export class AddressListComponent {
  newAddress: AddressInterface = EMPTY_ADDRESS;

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
    return await modal.present();
  }

  searchByName(event) {
    const query = event.target.value.toLowerCase();
    this.addressService.init(ADDRESS_HISTORY_PATH, 'start', {
      reverse: true, prepend: false, searchValue: query,
    });
  }

  exportCsv() {
    this.addressService.data.subscribe(res => {
      const tripsCsv = CsvTools.convertToCsv(res,
        ['start', 'end', 'locationName', 'purpose']);
      console.log(tripsCsv);
      const blob = new Blob([tripsCsv], {type: 'text/plain;charset=utf-8'});
      saveAs(blob, 'data.csv');
    });
  }

  calculateDaysPerYear(year: number): Map<string, number> {
    const res = new Map<string, number>();
    this.addressService.data.subscribe((addresses) => {
      addresses.forEach(address => {
        if (!res.has(address.country)) {
          res.set(address.country, 0);
        }
        const end = DateTime.min(
          DateTime.fromJSDate(address.end),
          DateTime.local(year, 12, 31));
        const start = DateTime.max(
          DateTime.fromJSDate(address.start),
          DateTime.local(year, 1, 1));
        const days = end.diff(start).as('days');
        res.set(address.country, days + res.get(address.country));
      });
    });
    return res;
  }
}
