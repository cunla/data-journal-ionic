import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BloodresultsPageRoutingModule } from './bloodresults-routing.module';

import { BloodresultsPage } from './list/bloodresults.page';
import {ToolsModule} from '../common/tools.module';
import {EditBioresultComponent} from './edit/edit-bioresult.component';
import {HttpClientModule} from '@angular/common/http';

@NgModule({
  imports: [
    HttpClientModule,
    ToolsModule,
    CommonModule,
    FormsModule,
    IonicModule,
    BloodresultsPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [BloodresultsPage, EditBioresultComponent]
})
export class BloodresultsModule {}
