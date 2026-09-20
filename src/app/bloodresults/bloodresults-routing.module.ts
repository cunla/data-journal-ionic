import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {BloodresultsComponent} from './list/bloodresults.component';
import {HomeGuard} from '../guard/home.guard';

const routes: Routes = [
  {
    path: '',
    component: BloodresultsComponent,
    canActivate: [HomeGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BloodresultsPageRoutingModule {
}
