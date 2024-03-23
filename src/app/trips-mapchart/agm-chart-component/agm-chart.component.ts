import {Component} from '@angular/core';
import {TripInterface, TripsService} from '../../trips/trips.service';
import {AddressInterface, AddressService} from "../../addresses/address.service";

export interface Point {
  lon: number;
  id: string;
  lat: number
}

const DEFAULT_ADDRESS = {id: 'Toronto', lat: 43.7, lon: -79.42};

@Component({
  selector: 'app-agm-chart',
  templateUrl: './agm-chart.component.html',
  styleUrls: ['./agm-chart.component.scss'],
})
export class AgmChartComponent {
  cities = new Set<Point>();
  trips: google.maps.LatLngLiteral[][] = [];
  currentAddress: Point;

  constructor(private tripsService: TripsService,
              private addressService: AddressService,) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    this.addressService.data.subscribe((addresses) => {
      this.currentAddress = this.getOriginPointOnDate([], addresses, -1) || DEFAULT_ADDRESS;

      this.tripsService.data.subscribe(trips => {
        const sortedTrips: TripInterface[] = trips.sort(AgmChartComponent.sortByDates);
        for (let ind = 0; ind < sortedTrips.length; ++ind) {
          const originCity = this.getOriginPointOnDate(sortedTrips, addresses, ind);
          const targetCity = AgmChartComponent.itemToPoint(sortedTrips[ind]);
          if (targetCity && targetCity.lat && targetCity.lon) {
            this.cities.add(targetCity);
            this.addTripIfRelevant(originCity, targetCity);
          }
        }
      });
    });
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

  private addTripIfRelevant(origin: Point, target: Point): void {
    if (!origin || origin.id === target.id) {
      return;
    }
    // const t = {
    //   name: `${origin.id} - ${target.id}`,
    //   origin,
    //   target,
    // };
    this.trips.push(
      [{lat: origin.lat, lng: origin.lon},
        {lat: target.lat, lng: target.lon},]);
  }

  private getOriginPointOnDate(trips: TripInterface[], addresses: AddressInterface[], tripInd: number): Point {
    const date = tripInd == -1 ? new Date() : trips[tripInd].start;
    if (trips.length > 0) {
      let low = 0, high = trips.length - 1;
      let mid = Math.floor((low + high) / 2);
      while (low <= high) {
        mid = Math.floor((low + high) / 2);
        if (mid == tripInd && tripInd > 0 && trips[tripInd - 1].start <= date && date <= trips[tripInd - 1].end) {
          return AgmChartComponent.itemToPoint(trips[tripInd - 1]);
        } else if (date < trips[mid].start) {
          high = mid - 1;
        } else if (trips[mid].end < date) {
          low = mid + 1;
        } else if (mid != tripInd && trips[mid].start <= date && date <= trips[mid].end) {
          return AgmChartComponent.itemToPoint(trips[mid]);
        } else {
          break;
        }
      }
    }
    let ind = 0;
    while (ind < addresses.length) {
      if (addresses[ind].start <= date &&
        (!addresses[ind].end || addresses[ind].end >= date)) {
        return AgmChartComponent.itemToPoint(addresses[ind]);
      }
      ++ind;
    }
    return null;
  }


  private static itemToPoint(item: TripInterface | AddressInterface): Point {
    return item ? {
      id: item.city,
      lon: +item.lng,
      lat: +item.lat,
    } : null;
  }

}
