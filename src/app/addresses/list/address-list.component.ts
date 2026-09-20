import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subject} from 'rxjs';
import {take, takeUntil} from 'rxjs/operators';
import {AddressInterface, AddressService, EMPTY_ADDRESS} from '../address.service';
import {CsvTools} from '../../common/csvtools.service';
import {saveAs} from 'file-saver';
import {ModalController} from '@ionic/angular/lazy';
import {EditAddressComponent} from '../edit-address/edit-address.component';
import {StateProvider} from '../../common/state.provider';
import {findGaps, findOverlaps, Gap, Overlap} from '../address-history';

@Component({
    selector: 'app-trips',
    templateUrl: './address-list.component.html',
    styleUrls: ['./address-list.component.scss'],
    standalone: false
})
export class AddressListComponent implements OnInit, OnDestroy {
  gaps: Gap[] = [];
  overlaps: Overlap[] = [];
  addressCount = 0;
  private readonly destroy$ = new Subject<void>();

  // A fresh copy per click; EMPTY_ADDRESS is shared and must stay untouched
  get newAddress(): AddressInterface {
    return {...EMPTY_ADDRESS};
  }

  constructor(public addressService: AddressService,
              private state: StateProvider,
              public modalController: ModalController,
  ) {
  }

  ngOnInit() {
    // Checks the history as it changes, so editing an address updates the notice
    this.addressService.data.pipe(takeUntil(this.destroy$)).subscribe(addresses => {
      this.addressCount = addresses.length;
      this.gaps = findGaps(addresses);
      this.overlaps = findOverlaps(addresses);
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
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
