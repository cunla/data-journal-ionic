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

const DEFAULT_ADDRESS={id:'Toronto',lat:43.7,lon:-79.42};

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
      this.currentAddress = (addresses.length === 0) ?  DEFAULT_ADDRESS: AgmChartComponent.itemToPoint(addresses[0]);
      this.tripsService.data.subscribe(trips => {
        const sortedTrips = trips.sort(AgmChartComponent.sortByDates);
        // tslint:disable-next-line:forin
        for (const ind in sortedTrips) {
          const originCity = AgmChartComponent.findOrigin(addresses, sortedTrips[ind]);
          const targetCity = AgmChartComponent.itemToPoint(sortedTrips[ind]);
          if (targetCity && targetCity.lat && targetCity.lon) {
            this.cities.add(targetCity);
            this.addTripIfRelevant(originCity, targetCity);
          }
        }
      });
    });
  }

  private static findOrigin(addresses: AddressInterface[], trip: TripInterface) {
    let ind = 0;
    while (ind < addresses.length) {
      if (addresses[ind].start <= trip.start &&
        (!addresses[ind].end || addresses[ind].end >= trip.end)) {
        const res = AgmChartComponent.itemToPoint(addresses[ind]);
        // console.log(`Found address ${ind}: ${res.id} for trip ${trip.city}`);
        return res;
      }
      ++ind;
    }
    console.warn('returning last address or no addresses in list');
    return (addresses.length === 0) ? null : AgmChartComponent.itemToPoint(addresses[addresses.length - 1]);
  }

  private static itemToPoint(item: TripInterface | AddressInterface): Point {
    return {
      id: item.city,
      lon: +item.lng,
      lat: +item.lat,
    };
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
