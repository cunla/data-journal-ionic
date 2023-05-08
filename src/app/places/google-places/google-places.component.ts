import {Component, ElementRef, EventEmitter, Input, NgZone, Output} from '@angular/core';

declare var google;

export const EMPTY_LOCATION: LocationInterface = {
  country: null,
  city: null,
  state: null,
  iso2: null,
  iso3: null,
  locationName: null,
  lat: null,
  lng: null,
  population: null,
}

export interface LocationInterface {
  country: string;
  city: string;
  state: string;
  iso2: string;
  iso3: string;
  locationName: string;
  lat: number;
  lng: number;
  population: number;
}

@Component({
  selector: 'google-places-autocomplete',
  template: `
    <ion-toolbar>
      <ion-searchbar [(ngModel)]="autocomplete.input"
                     (ionInput)="UpdateSearchResults()"
                     [placeholder]="placeholder"
                     (ionClear)="ClearAutocomplete()">
      </ion-searchbar>
      <ion-list [hidden]="autocompleteItems.length == 0">
        <ion-item *ngFor="let item of autocompleteItems" tappable
                  (click)="selectedItem(item)">
          {{ item.description }}
        </ion-item>
      </ion-list>
    </ion-toolbar>
  `
})
export class GooglePlacesAutocompleteComponent {
  @Output("callback") callback: EventEmitter<any> = new EventEmitter();
  @Input('placeholder') placeholder: string = 'Search for place';
  @Input('value') initialValue: string = '';
  autocomplete: { input: string; };
  autocompleteItems: any[];
  private googlePlaces: any;
  private geocoder: any;

  constructor(private el: ElementRef, public zone: NgZone,) {
    this.geocoder = new google.maps.Geocoder();
    this.googlePlaces = new google.maps.places.AutocompleteService();
    this.autocomplete = {input: ''};
    this.autocompleteItems = [];
  }


  ngOnInit() {
    this.autocomplete = {input: this.initialValue};
  }

  UpdateSearchResults() {
    if (this.autocomplete.input == '') {
      this.autocompleteItems = [];
      return;
    }
    this.googlePlaces.getPlacePredictions({input: this.autocomplete.input},
      (predictions, status) => {
        this.autocompleteItems = [...predictions];
      });
  }

  selectedItem(item) {
    this.geocoder.geocode({placeId: item.place_id},
      (results, status) => {
        const address = results[0];
        const location: LocationInterface = EMPTY_LOCATION;
        location.lat = address.geometry.location.lat();
        location.lng = address.geometry.location.lng();
        address.address_components.forEach(component => {
          if (component.types.some(i => i === 'administrative_area_level_1')) {
            location.state = component.long_name;
          } else if (component.types.some(i => i === "country")) {
            location.country = component.long_name;
            location.iso2 = component.short_name;
          } else if (component.types.some(i => i === "locality")) {
            location.city = component.long_name;
          }
        });
        location.locationName = address.formatted_address;
        this.callback.emit(location);
      }
    );
    this.autocompleteItems = [];
    this.autocomplete.input = item.description;
  }

  ClearAutocomplete() {
    this.autocompleteItems = [];
    this.autocomplete.input = '';
  }
}
