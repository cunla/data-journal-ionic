import {NgModule} from '@angular/core';
import {PreloadAllModules, RouterModule, Routes} from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'bloodresults',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'trips',
    loadChildren: () => import('./trips/trips.module').then(m => m.TripsModule)
  },
  {
    path: 'addresses',
    loadChildren: () => import('./addresses/address.module').then(m => m.AddressModule)
  },
  {
    path: 'map',
    loadChildren: () => import('./data/data.module').then(m => m.DataModule)
  },
  {
    path: 'bloodresults',
    loadChildren: () => import('./bloodresults/bloodresults.module').then(m => m.BloodresultsModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {preloadingStrategy: PreloadAllModules})
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
