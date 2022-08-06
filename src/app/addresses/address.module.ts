import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AddressListComponent} from './list/address-list.component';
import {RouterModule, Routes} from '@angular/router';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {AddressService} from './address.service';
import {EditAddressComponent} from './edit-address/edit-address.component';
import {AddressComponent} from './address/address.component';
import {HomeGuard} from '../guard/home.guard';
import {HomeGuardModule} from '../guard/home.guard.module';
import {ToolsModule} from '../common/tools.module';
import {AngularFireModule} from '@angular/fire/compat';
import {environment} from '../../environments/environment';
import {AngularFirestoreModule} from '@angular/fire/compat/firestore';
import {IonicModule} from '@ionic/angular';
import {AgmCoreModule} from '@agm/core';
import {PlacesModule} from "../places/places.module";

const routes: Routes = [
  {path: '', redirectTo: 'list', pathMatch: 'full'},
  {path: 'list', component: AddressListComponent, canActivate: [HomeGuard]},
];

@NgModule({
  declarations: [
    AddressListComponent,
    EditAddressComponent,
    AddressComponent,
  ],
  imports: [
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
    HomeGuardModule,
    ToolsModule,
    IonicModule,
    AgmCoreModule,
    PlacesModule,
  ],
  providers: [
    AddressService,
  ],
})
export class AddressModule {
}
