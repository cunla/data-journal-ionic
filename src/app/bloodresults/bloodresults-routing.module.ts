import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BloodresultsPage } from './list/bloodresults.page';

const routes: Routes = [
  {
    path: '',
    component: BloodresultsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BloodresultsPageRoutingModule {}
