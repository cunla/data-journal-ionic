import {Component, OnDestroy} from '@angular/core';
import {TripInterface, TripsService} from '../../trips/trips.service';
import {AddressInterface, AddressService} from "../../addresses/address.service";
import {getOriginPointOnDate, itemToPoint, Point} from '../origin-point';
import {environment} from '../../../environments/environment';
import {Subject} from 'rxjs';
import {switchMap, takeUntil} from 'rxjs/operators';

const DEFAULT_ADDRESS = {id: 'Toronto', lat: 43.7, lon: -79.42, year: new Date().getFullYear()};

export interface TripLine {
  polyline: google.maps.LatLngLiteral[];
  year: number;
  options?: google.maps.PolylineOptions;
}

@Component({
    selector: 'app-agm-chart',
    templateUrl: './agm-chart.component.html',
    styleUrls: ['./agm-chart.component.scss'],
    standalone: false
})
export class AgmChartComponent implements OnDestroy {
  cities = new Set<Point>();
  tripLines: TripLine[] = [];
  years: number[] = [];
  selectedYear = -1;
  currentAddress: Point;
  readonly mapOptions = {
    minZoom: 2, maxZoom: 4, zoomControl: false, streetViewControl: false,
    mapId: environment.mapsMapId,
  };
  private destroy$ = new Subject<void>();

  constructor(private tripsService: TripsService,
              private addressService: AddressService,) {
    this.addressService.data.pipe(
      switchMap(addresses => this.tripsService.data.pipe(
        switchMap(trips => [{addresses, trips}])
      )),
      takeUntil(this.destroy$),
    ).subscribe(({addresses, trips}) => {
      this.rebuild(addresses, trips);
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private rebuild(addresses: AddressInterface[], trips: TripInterface[]) {
    this.cities = new Set<Point>();
    this.tripLines = [];
    this.years = [];
    this.currentAddress = getOriginPointOnDate([], addresses, -1) || DEFAULT_ADDRESS;
    const sortedTrips = [...trips].sort(AgmChartComponent.sortByDates);
    sortedTrips.forEach(trip => {
      const year = trip.start.getFullYear();
      if (!this.years.includes(year)) {
        this.years.push(year);
      }
    });
    this.years.sort((a, b) => b - a);
    for (let ind = 0; ind < sortedTrips.length; ++ind) {
      const originCity = getOriginPointOnDate(sortedTrips, addresses, ind);
      const targetCity = itemToPoint(sortedTrips[ind]);
      if (targetCity && targetCity.lat && targetCity.lon) {
        this.addCityOptions(targetCity);
        this.cities.add(targetCity);
        this.addTripIfRelevant(sortedTrips[ind].start.getFullYear(), originCity, targetCity);
      }
    }
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
    const t: TripLine = {
      year: year,
      polyline: [
        {lat: origin.lat, lng: origin.lon},
        {lat: target.lat, lng: target.lon}]
    };
    this.addPolyLineOptions(t);
    this.tripLines.push(t);
  }



  addPolyLineOptions(item: TripLine) {
    if (this.selectedYear === -1 || this.selectedYear === item.year) {
      item.options = {geodesic: true, strokeColor: 'red', strokeWeight: 1, strokeOpacity: 1};
    } else {
      item.options = {geodesic: true, strokeColor: 'red', strokeWeight: 0.3, strokeOpacity: 1};
    }
  }

  addCityOptions(item: Point) {
    const active = this.selectedYear === -1 || this.selectedYear === item.year;
    item.title = item.year.toString();
    item.content = this.createMarkerContent(active ? 1 : 0.2);
  }

  private createMarkerContent(opacity: number): HTMLElement {
    const div = document.createElement('div');
    div.style.cssText = `width:12px;height:12px;border-radius:50%;background:#db4437;border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,.3);opacity:${opacity}`;
    return div;
  }

  updateOptions() {
    this.tripLines.forEach(trip => this.addPolyLineOptions(trip));
    this.cities.forEach(city => this.addCityOptions(city));
  }
}
