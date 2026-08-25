import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {RouteReuseStrategy} from '@angular/router';
import {IonicModule, IonicRouteStrategy} from '@ionic/angular/lazy';
import {AppComponent} from './app.component';
import {AppRoutingModule} from './app-routing.module';
import {AuthModule} from './auth/auth.module';
import {GoogleMapsModule} from "@angular/google-maps";
import {environment} from '../environments/environment';
import {AngularFireModule} from '@angular/fire/compat';
import {provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import {provideHighcharts} from 'highcharts-angular';
import {provideAuth, getAuth} from '@angular/fire/auth';
import {provideFirebaseApp, getApp, initializeApp} from '@angular/fire/app';
import {getApps} from 'firebase/app';


@NgModule({
  declarations: [AppComponent,],
  imports: [
    AngularFireModule.initializeApp(environment.firebase),
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    AuthModule,
    GoogleMapsModule,
  ],
  providers: [
    {provide: RouteReuseStrategy, useClass: IonicRouteStrategy},
    provideHttpClient(withInterceptorsFromDi()),
    provideHighcharts(),
    provideFirebaseApp(() => getApps().length > 0 ? getApp() : initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
