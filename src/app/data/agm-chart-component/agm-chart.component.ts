import {Component, OnInit} from '@angular/core';
import {TripInterface, TripsService} from '../../trips/trips.service';
import {AddressInterface, AddressService} from '../../addresses/address.service';


export interface Point {
  lon: number;
  id: string;
  lat: number
}

export interface Path {
  name: string;
  origin: Point;
  target: Point;
}

const DEFAULT_ADDRESS = {id: 'Toronto', lat: 43.7, lon: -79.42};

@Component({
  selector: 'app-agm-chart',
  templateUrl: './agm-chart.component.html',
  styleUrls: ['./agm-chart.component.scss'],
})
export class AgmChartComponent implements OnInit {
  cities = new Set<Point>();
  trips: Array<Path> = [];
  private currentAddress: Point;

  constructor(private tripsService: TripsService,
              private addressService: AddressService,) {
    this.addressService.data.subscribe(addresses => {
      this.currentAddress = AgmChartComponent.itemToPoint(
        this.addressService.getAddressOnDate(new Date())) || DEFAULT_ADDRESS;

      this.tripsService.data.subscribe(trips => {
        const sortedTrips = trips.sort(AgmChartComponent.sortByDates);
        // tslint:disable-next-line:forin
        for (const ind in sortedTrips) {
          const originCity = AgmChartComponent.itemToPoint(this.addressService.getAddressOnDate(sortedTrips[ind].start));
          const targetCity = AgmChartComponent.itemToPoint(sortedTrips[ind]);
          if (targetCity && targetCity.lat && targetCity.lon) {
            this.cities.add(targetCity);
            this.addTripIfRelevant(originCity, targetCity);
          }
        }
      });
    });
  }

  private static itemToPoint(item: TripInterface | AddressInterface): Point {
    return item ? {
      id: item.city,
      lon: +item.lng,
      lat: +item.lat,
    } : null;
  }

  private static sortByDates(a: TripInterface, b: TripInterface) {
    if (a.start > b.start) {
      return 1;
    } else if (a.start < b.start) {
      return -1;
    } else {
      return 0;
    }
  }

  ngOnInit() {
  }

  private addTripIfRelevant(origin: Point, target: Point): void {
    if (!origin || origin.id === target.id) {
      return;
    }
    const t = {
      name: `${origin.id} - ${target.id}`,
      origin,
      target,
    };
    this.trips.push(t);
  }

}
