import {Component, OnInit} from '@angular/core';
import {EMPTY_TRIP, TripInterface, TripsService} from '../trips.service';
import {CsvTools} from '../../common/csvtools.service';
import {saveAs} from 'file-saver';
import {ModalController} from '@ionic/angular';
import {EditTripComponent} from '../edit-trip/edit-trip.component';
import {StateProvider} from '../../common/state.provider';
import {DateTime} from "luxon";
import {IonRefresherCustomEvent} from "@ionic/core/dist/types/components";

@Component({
  selector: 'app-trips',
  templateUrl: './trips-list.component.html',
  styleUrls: ['./trips-list.component.scss']
})
export class TripsListComponent implements OnInit {
  newTrip: TripInterface = EMPTY_TRIP;

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
    this.trips.data.subscribe(res => {
      const tripsCsv = CsvTools.convertToCsv(res,
        ['start', 'end', 'locationName', 'purpose']);
      console.log(tripsCsv);
      const blob = new Blob([tripsCsv], {type: 'text/plain;charset=utf-8'});
      saveAs(blob, 'data.csv');
    });
  }

  calculateDaysPerYear(year: number): Map<string, number> {
    const res = new Map<string, number>();
    this.trips.data.subscribe((trips) => {
      trips.forEach(trip => {
        if (!res.has(trip.country)) {
          res.set(trip.country, 0);
        }
        const end = DateTime.min(
          DateTime.fromJSDate(trip.end),
          DateTime.local(year, 12, 31));
        const start = DateTime.max(
          DateTime.fromJSDate(trip.start),
          DateTime.local(year, 1, 1));
        const days = end.diff(start).as('days');
        res.set(trip.country, days + res.get(trip.country));
        res.set(trip.country, res.get(trip.country) + days);
      });
    });
    return res;
  }

  doRefresh(event: IonRefresherCustomEvent<never>) {
    this.trips.refresh();
    event?.target.complete().then();
  }
}
