import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { IioPageRoutingModule } from './iio-routing.module';

import { IioPage } from './iio.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    IioPageRoutingModule
  ],
  declarations: [IioPage]
})
export class IioPageModule {}
