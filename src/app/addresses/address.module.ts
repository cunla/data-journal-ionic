import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddressListComponent } from './list/address-list.component';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AddressService } from './address.service';
import { EditAddressComponent } from './edit-address/edit-address.component';
import { AddressComponent } from './address/address.component';
import { HomeGuard } from '../guard/home.guard';
import { HomeGuardModule } from '../guard/home.guard.module';
import { ToolsModule } from '../common/tools.module';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { IonicModule } from '@ionic/angular/lazy';
import { PlacesModule } from "../places/places.module";
import { GoogleMapsModule } from "@angular/google-maps";

const routes: Routes = [
  { path: '', redirectTo: 'list', pathMatch: 'full' },
  { path: 'list', component: AddressListComponent, canActivate: [HomeGuard] },
];

@NgModule({
  declarations: [
    AddressListComponent,
    EditAddressComponent,
    AddressComponent,
  ],
  imports: [
    AngularFirestoreModule,
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
    HomeGuardModule,
    ToolsModule,
    IonicModule,
    PlacesModule,
    GoogleMapsModule,
  ],
  providers: [
    AddressService,
  ],
})
export class AddressModule {
}
