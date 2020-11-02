import {Component, ElementRef, EventEmitter, Input, NgZone, Output} from '@angular/core';
import {GeocoderResult, GeocoderStatus} from "@agm/core";

declare var google;

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
      (results: Array<GeocoderResult>, status: GeocoderStatus) => {
        this.callback.emit(results);
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
