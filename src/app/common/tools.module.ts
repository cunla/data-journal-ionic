import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {StateProvider} from './state.provider';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
  ],
  providers: [
    StateProvider,
  ]
})
export class ToolsModule {
  constructor() {
  }
}
