import {Component, OnInit} from '@angular/core';
import {ADDRESS_HISTORY_PATH, AddressInterface, AddressService, EMPTY_ADDRESS} from '../address.service';
import {CsvTools} from '../../common/csvtools.service';
import {saveAs} from 'file-saver';
import * as moment from 'moment';
import {ModalController} from '@ionic/angular';
import {EditAddressComponent} from '../edit-address/edit-address.component';

@Component({
  selector: 'app-trips',
  templateUrl: './address-list.component.html',
  styleUrls: ['./address-list.component.scss']
})
export class AddressListComponent implements OnInit {
  newAddress: AddressInterface = EMPTY_ADDRESS;

  constructor(public addressService: AddressService,
              public modalController: ModalController,
  ) {
  }

  async presentModal(address: AddressInterface) {
    const modal = await this.modalController.create({
      component: EditAddressComponent,
      componentProps: {address,}
    });
    return await modal.present();
  }

  ngOnInit() {
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
        const end = moment.min(moment(address.end), moment([year, 11, 31]));
        const start = moment.max(moment(address.start), moment([year, 0, 1]));
        const days = end.diff(start);
        res.set(address.country, res.get(address.country) + days);
      });
    });
    return res;
  }
}
