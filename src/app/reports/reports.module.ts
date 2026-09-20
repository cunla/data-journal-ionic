import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {RouterModule, Routes} from '@angular/router';
import {IonicModule} from '@ionic/angular/lazy';
import {HomeGuard} from '../guard/home.guard';
import {HomeGuardModule} from '../guard/home.guard.module';
import {ReportsComponent} from './reports.component';

const routes: Routes = [
  {path: '', component: ReportsComponent, canActivate: [HomeGuard]},
];

@NgModule({
  declarations: [
    ReportsComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes),
    HomeGuardModule,
    IonicModule,
  ],
})
export class ReportsModule {
}
