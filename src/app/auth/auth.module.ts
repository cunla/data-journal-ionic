import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';


import {LoginPage} from './login/login.page';
import {AuthRoutingModule} from './auth-routing.module';
import {AuthService} from './auth.service';
import {AuthGuard} from './auth.guard';
import {AngularFireModule} from '@angular/fire/compat';
import {AngularFireAuthModule} from '@angular/fire/compat/auth';
import {environment} from '../../environments/environment';
import {ResetPasswordPage} from './reset-password/reset-password.page';
import {SignupPage} from './signup/signup.page';

@NgModule({
  imports: [
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule, // imports firebase/auth, only needed for auth features
    CommonModule,
    FormsModule,
    IonicModule,
    AuthRoutingModule,
  ],
  declarations: [
    LoginPage,
    ResetPasswordPage,
    SignupPage,
  ],
  providers: [AuthService, AuthGuard],
})
export class AuthModule {
}
