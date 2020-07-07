import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule, Routes} from '@angular/router';
import {ToolsModule} from '../common/tools.module';
import {IonicModule} from '@ionic/angular';
import {AgmCoreModule} from '@agm/core';
import {AgmChartComponent} from './agm-chart-component/agm-chart.component';

const routes: Routes = [
  {path: '', redirectTo: 'map', pathMatch: 'full'},
  {path: 'map', component: AgmChartComponent},
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
    AgmCoreModule,
  ],
  providers: [
  ],
})
export class DataModule {
}
