import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {BloodresultsComponent} from './list/bloodresults.component';

const routes: Routes = [
  {
    path: '',
    component: BloodresultsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BloodresultsPageRoutingModule {
}
