import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BloodresultsPageRoutingModule } from './bloodresults-routing.module';

import { BloodresultsPage } from './bloodresults.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BloodresultsPageRoutingModule
  ],
  declarations: [BloodresultsPage]
})
export class BloodresultsPageModule {}
