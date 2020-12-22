import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { IioPage } from './iio.page';

const routes: Routes = [
  {
    path: '',
    component: IioPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class IioPageRoutingModule {}
