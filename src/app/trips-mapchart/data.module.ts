import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule, Routes} from '@angular/router';
import {ToolsModule} from '../common/tools.module';
import {IonicModule} from '@ionic/angular';
import {AgmChartComponent} from './agm-chart-component/agm-chart.component';
import {GoogleMapsModule} from "@angular/google-maps";

const routes: Routes = [
  {path: '', redirectTo: 'view', pathMatch: 'full'},
  {path: 'view', component: AgmChartComponent},
];


@NgModule({
  declarations: [
    AgmChartComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ToolsModule,
    IonicModule,
    GoogleMapsModule,
  ],
  providers: [],
})
export class DataModule {
}
