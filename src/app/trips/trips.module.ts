import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TripsListComponent} from './list/trips-list.component';
import {RouterModule, Routes} from '@angular/router';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {TripsService} from './trips.service';
import {EditTripComponent} from './edit-trip/edit-trip.component';
import {TripComponent} from './trip/trip.component';
import {HomeGuard} from '../guard/home.guard';
import {HomeGuardModule} from '../guard/home.guard.module';
import {ToolsModule} from '../common/tools.module';
import {AngularFireModule} from '@angular/fire';
import {environment} from '../../environments/environment';
import {AngularFirestoreModule} from '@angular/fire/firestore';
import {IonicModule} from '@ionic/angular';
import {AutoCompleteModule} from 'ionic4-auto-complete';
import {AgmCoreModule} from '@agm/core';

const routes: Routes = [
  {path: '', redirectTo: 'list', pathMatch: 'full'},
  {path: 'list', component: TripsListComponent, canActivate: [HomeGuard]},
];

@NgModule({
  declarations: [
    TripsListComponent,
    EditTripComponent,
    TripComponent,
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
    AutoCompleteModule,
    AgmCoreModule,
  ],
  providers: [
    TripsService,
  ],
})
export class TripsModule {
}
