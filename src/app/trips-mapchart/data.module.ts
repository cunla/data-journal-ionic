import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule, Routes} from '@angular/router';
import {ToolsModule} from '../common/tools.module';
import {IonicModule} from '@ionic/angular/lazy';
import {AgmChartComponent} from './agm-chart-component/agm-chart.component';
import {GoogleMapsModule} from "@angular/google-maps";
import {HomeGuard} from '../guard/home.guard';
import {HomeGuardModule} from '../guard/home.guard.module';
import {FormsModule} from "@angular/forms";

const routes: Routes = [
  {path: '', redirectTo: 'view', pathMatch: 'full'},
  {path: 'view', component: AgmChartComponent, canActivate: [HomeGuard]},
];


@NgModule({
  declarations: [
    AgmChartComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ToolsModule,
    HomeGuardModule,
    IonicModule,
    GoogleMapsModule,
    FormsModule,
  ],
  providers: [],
})
export class DataModule {
}
