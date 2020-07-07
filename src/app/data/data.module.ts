import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule, Routes} from '@angular/router';
import {ToolsModule} from '../common/tools.module';
import {ChartComponent} from './chart/chart.component';
import {HighchartsChartModule} from 'highcharts-angular';
import {IonicModule} from '@ionic/angular';

const routes: Routes = [
  {path: '', redirectTo: 'map', pathMatch: 'full'},
  {path: 'map', component: ChartComponent},
];


@NgModule({
  declarations: [
    ChartComponent,
  ],
  imports: [
    HighchartsChartModule,
    CommonModule,
    RouterModule.forChild(routes),
    ToolsModule,
    IonicModule,
  ],
  providers: [
  ],
})
export class DataModule {
}
