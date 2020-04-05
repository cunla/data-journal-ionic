import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HttpClientModule} from '@angular/common/http';
import {CitiesService} from './cities.service';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    HttpClientModule,
  ],
  providers: [
    CitiesService,
  ]
})
export class ToolsModule {
  constructor() {
  }
}
