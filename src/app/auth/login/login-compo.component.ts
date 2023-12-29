import {Component} from '@angular/core';
import {AuthService} from '../auth.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login-compo.component.html',
  styleUrls: ['./login-compo.component.scss'],
})
export class LoginComponent {
  userEmail: string;
  userPassword: string;

  constructor(public authService: AuthService,
              private router: Router,) {
  }


  login(provider: string) {
    let loginPromise: Promise<unknown>;
    switch (provider) {
      case 'facebook':
        loginPromise = this.authService.doFacebookLogin();
        break;
      case 'google':
        loginPromise = this.authService.doGoogleLogin();
        break;
      case 'email':
        loginPromise = this.authService.doEmailLogin(this.userEmail, this.userPassword);
        break;
    }
    loginPromise.then(() => {
      if (this.authService.isLoggedIn) {
        this.router.navigateByUrl('/').then();
      }
    });
  }

}
