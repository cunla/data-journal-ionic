import {Component, OnInit} from '@angular/core';
import {take} from 'rxjs/operators';
import {EMPTY_TRIP, TripInterface, TripsService} from '../trips.service';
import {CsvTools} from '../../common/csvtools.service';
import {saveAs} from 'file-saver';
import {ModalController, RefresherCustomEvent} from '@ionic/angular/lazy';
import {EditTripComponent} from '../edit-trip/edit-trip.component';
import {StateProvider} from '../../common/state.provider';

@Component({
    selector: 'app-trips',
    templateUrl: './trips-list.component.html',
    styleUrls: ['./trips-list.component.scss'],
    standalone: false
})
export class TripsListComponent implements OnInit {
  // A fresh copy per click; EMPTY_TRIP is shared and must stay untouched
  get newTrip(): TripInterface {
    return {...EMPTY_TRIP};
  }

  constructor(public trips: TripsService,
              private state: StateProvider,
              private modalController: ModalController,
  ) {
  }

  async presentModal(trip: TripInterface) {
    if (this.state.modalOpen) {
      return;
    }
    this.state.modalOpen = true;
    const modal = await this.modalController.create({
      component: EditTripComponent,
      componentProps: {trip,}
    });
    // Clear the flag however the modal is closed, including backdrop/Esc/back
    modal.onDidDismiss().then(() => this.state.modalOpen = false);
    return await modal.present();
  }

  ngOnInit() {
    const searchbar = document.querySelector('ion-searchbar');
    searchbar.addEventListener('ionInput', this.searchByName.bind(this));
    this.trips.refresh();
  }

  searchByName(event) {
    const query = event.target.value.toLowerCase();
    this.trips.init('trips', 'start', {
      reverse: true, prepend: false, searchValue: query,
    });
  }

  exportCsv() {
    this.trips.data.pipe(take(1)).subscribe(res => {
      const tripsCsv = CsvTools.convertToCsv(res,
        ['start', 'end', 'locationName', 'purpose']);
      const blob = new Blob([tripsCsv], {type: 'text/csv;charset=utf-8'});
      saveAs(blob, 'trips.csv');
    });
  }


  doRefresh(event: RefresherCustomEvent) {
    this.trips.refresh();
    event?.target.complete().then();
  }
}
