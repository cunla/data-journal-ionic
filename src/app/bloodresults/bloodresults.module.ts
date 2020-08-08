import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';

import {BloodresultsPageRoutingModule} from './bloodresults-routing.module';

import {BloodresultsPage} from './list/bloodresults.page';
import {ToolsModule} from '../common/tools.module';
import {EditBioresultComponent} from './edit/edit-bioresult.component';
import {HttpClientModule} from '@angular/common/http';
import {ResultChartComponent} from './resultchart/resultchart.component';
import {HighchartsChartModule} from 'highcharts-angular';
import {BioService} from './bio.service';
import {BioMetadataService} from './bio-metadata.service';
import {AutoCompleteModule} from 'ionic4-auto-complete';
import {AddBioresultComponent} from './add/add-bioresult.component';
import {BioresultBarModule} from "./bioresult-bar/bioresult-bar.module";

@NgModule({
  imports: [
    HttpClientModule,
    ToolsModule,
    CommonModule,
    FormsModule,
    IonicModule,
    BloodresultsPageRoutingModule,
    ReactiveFormsModule,
    HighchartsChartModule,
    AutoCompleteModule,
    BioresultBarModule,
  ],
  declarations: [
    BloodresultsPage,
    EditBioresultComponent,
    ResultChartComponent,
    AddBioresultComponent,
  ],
  providers: [
    BioMetadataService,
    BioService,
  ],
})
export class BloodresultsModule {
  constructor(private bioMetadataService: BioMetadataService) {
  }

}
