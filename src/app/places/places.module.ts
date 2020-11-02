import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';
import {GooglePlacesAutocompleteComponent} from "./google-places/google-places.component";
import {HttpClientModule} from "@angular/common/http";

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    IonicModule,
    FormsModule,
  ],
  declarations: [
    GooglePlacesAutocompleteComponent,
  ],
  providers: [],
  exports: [
    GooglePlacesAutocompleteComponent
  ]
})
export class PlacesModule {
}
