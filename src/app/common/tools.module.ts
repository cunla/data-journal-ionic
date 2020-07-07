import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HttpClientModule} from '@angular/common/http';
import {CitiesService} from './cities.service';
import {StateProvider} from './state.provider';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    HttpClientModule,
  ],
  providers: [
    CitiesService,
    StateProvider,
  ]
})
export class ToolsModule {
  constructor() {
  }
}
