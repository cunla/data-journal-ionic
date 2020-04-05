import {Component, Input, OnInit} from '@angular/core';
import {TripInterface, TripsService} from '../trips.service';
import {Dates} from "../../common/dates";

@Component({
  selector: 'app-trip',
  templateUrl: './trip.component.html',
  styleUrls: ['./trip.component.scss']
})
export class TripComponent implements OnInit {
  @Input() trip: TripInterface;
  daysDiff = Dates.daysDiffFunc;

  constructor(private trips: TripsService) {
  }


  ngOnInit() {
  }

  delete() {
    this.trips.delete(this.trip.id).then(
      () => {
        this.trips.refresh();
      }, err => {
        console.log(err);
      });
  }
}
