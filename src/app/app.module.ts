import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {RouteReuseStrategy} from '@angular/router';

import {IonicModule, IonicRouteStrategy} from '@ionic/angular';
import {SplashScreen} from '@ionic-native/splash-screen/ngx';
import {StatusBar} from '@ionic-native/status-bar/ngx';

import {AppComponent} from './app.component';
import {AppRoutingModule} from './app-routing.module';
import {AuthModule} from './auth/auth.module';
import {AgmCoreModule} from '@agm/core';
import {environment} from '../environments/environment';
import {BloodresultsModule} from './bloodresults/bloodresults.module';

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    BloodresultsModule,
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    AuthModule,
    AgmCoreModule.forRoot({
      apiKey: environment.firebase.apiKey
    }),
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: RouteReuseStrategy, useClass: IonicRouteStrategy}
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
