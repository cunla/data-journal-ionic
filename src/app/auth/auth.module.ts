import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';


import {LoginComponent} from './login/login-compo.component';
import {AuthRoutingModule} from './auth-routing.module';
import {AuthService} from './auth.service';
import {AuthGuard} from './auth.guard';
import {ResetPasswordComponent} from './reset-password/reset-password.component';
import {SignupComponent} from './signup/signup.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AuthRoutingModule,
  ],
  declarations: [
    LoginComponent,
    ResetPasswordComponent,
    SignupComponent,
  ],
  providers: [AuthService, AuthGuard],
})
export class AuthModule {
}
