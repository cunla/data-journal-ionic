import {Component} from '@angular/core';
import {TripInterface, TripsService} from '../../trips/trips.service';
import {AddressInterface, AddressService} from "../../addresses/address.service";

export interface Point {
  lon: number;
  id: string;
  year: number;
  lat: number;
  options?: any;
}

const DEFAULT_ADDRESS = {id: 'Toronto', lat: 43.7, lon: -79.42, year: new Date().getFullYear()};

export interface TripLine {
  polyline: google.maps.LatLngLiteral[];
  year: number;
  options?: any;
}

@Component({
  selector: 'app-agm-chart',
  templateUrl: './agm-chart.component.html',
  styleUrls: ['./agm-chart.component.scss'],
})
export class AgmChartComponent {
  cities = new Set<Point>();
  tripLines: TripLine[] = [];
  years: number[] = [];
  selectedYear: number = -1;
  currentAddress: Point;

  constructor(private tripsService: TripsService,
              private addressService: AddressService,) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    this.addressService.data.subscribe((addresses) => {
      this.currentAddress = this.getOriginPointOnDate([], addresses, -1) || DEFAULT_ADDRESS;

      this.tripsService.data.subscribe(trips => {
        trips.forEach(trip => {
          if (!this.years.includes(trip.start.getFullYear())) {
            this.years.push(trip.start.getFullYear());
            this.years.sort((a, b) => b - a);
          }
        });
        const sortedTrips: TripInterface[] = trips.sort(AgmChartComponent.sortByDates);
        for (let ind = 0; ind < sortedTrips.length; ++ind) {
          const originCity = this.getOriginPointOnDate(sortedTrips, addresses, ind);
          const targetCity = AgmChartComponent.itemToPoint(sortedTrips[ind]);
          if (targetCity && targetCity.lat && targetCity.lon) {
            this.addCityOptions(targetCity);
            this.cities.add(targetCity);
            this.addTripIfRelevant(sortedTrips[ind].start.getFullYear(), originCity, targetCity);
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

  private addTripIfRelevant(year: number, origin: Point, target: Point): void {
    if (!origin || origin.id === target.id) {
      return;
    }
    // const t = {
    //   name: `${origin.id} - ${target.id}`,
    //   origin,
    //   target,
    // };
    const t: TripLine = {
      year: year,
      polyline: [
        {lat: origin.lat, lng: origin.lon},
        {lat: target.lat, lng: target.lon}]
    };
    this.addPolyLineOptions(t);
    this.tripLines.push(t);
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
      year: item.start.getFullYear(),
    } : null;
  }

  addPolyLineOptions(item: TripLine) {
    if (this.selectedYear === -1 || this.selectedYear === item.year) {
      item.options = {geodesic: true, strokeColor: 'red', strokeWeight: 1, strokeOpacity: 1};
    } else {
      item.options = {geodesic: true, strokeColor: 'red', strokeWeight: 0.3, strokeOpacity: 1};
    }
  }

  addCityOptions(item: Point) {
    if (this.selectedYear === -1 || this.selectedYear === item.year) {
      item.options = {title: item.year.toString()};
    } else {
      item.options = {title: item.year.toString(), opacity: 0.2};
    }
  }

  updateOptions() {
    this.tripLines.forEach((trip) => {
      this.addPolyLineOptions(trip);
    });
    this.cities.forEach((city) => {
      this.addCityOptions(city);
    });
  }
}
