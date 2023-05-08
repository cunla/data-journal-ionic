import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {RouteReuseStrategy} from '@angular/router';
import {IonicModule, IonicRouteStrategy} from '@ionic/angular';
import {AppComponent} from './app.component';
import {AppRoutingModule} from './app-routing.module';
import {AuthModule} from './auth/auth.module';
import {BloodresultsModule} from './bloodresults/bloodresults.module';
import {GoogleMapsModule} from "@angular/google-maps";

@NgModule({
  declarations: [AppComponent,],
  imports: [
    BloodresultsModule,
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    AuthModule,
    GoogleMapsModule,
  ],
  providers: [
    {provide: RouteReuseStrategy, useClass: IonicRouteStrategy}
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
