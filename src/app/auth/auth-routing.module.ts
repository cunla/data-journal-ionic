import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {LoginPage} from './login/login.page';
import {ResetPasswordPage} from './reset-password/reset-password.page';
import {AuthGuard} from './auth.guard';
import {SignupPage} from './signup/signup.page';


const routes: Routes = [
  {
    path: 'login',
    component: LoginPage,
    canActivate: [AuthGuard],
  },
  {
    path: 'reset-password',
    component: ResetPasswordPage,
    canActivate: [AuthGuard],
  },
  {
    path: 'signup',
    component: SignupPage,
    canActivate: [AuthGuard],
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthRoutingModule {
}
