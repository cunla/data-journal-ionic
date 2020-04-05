import {Component, OnInit} from '@angular/core';
import {EMPTY_TRIP, TripInterface, TripsService} from '../trips.service';
import {CsvTools} from '../../common/csvtools.service';
import {saveAs} from 'file-saver';
import * as moment from 'moment';

@Component({
  selector: 'app-trips',
  templateUrl: './trips-list.component.html',
  styleUrls: ['./trips-list.component.scss']
})
export class TripsListComponent implements OnInit {
  newTrip: TripInterface = EMPTY_TRIP;

  constructor(public trips: TripsService,
  ) {
  }

  ngOnInit() {
    const searchbar = document.querySelector('ion-searchbar');
    searchbar.addEventListener('ionInput', this.searchByName.bind(this));

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
        const end = moment.min(moment(trip.end), moment([year, 11, 31]));
        const start = moment.max(moment(trip.start), moment([year, 0, 1]));
        const days = end.diff(start);
        res.set(trip.country, res.get(trip.country) + days);
      });
    });
    return res;
  }
}
