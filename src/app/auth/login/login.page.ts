import {Component, OnInit} from '@angular/core';
import {AuthService} from '../auth.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  userEmail: string;
  userPassword: string;

  constructor(public authService: AuthService,
              private router: Router,) {
  }

  ngOnInit() {
  }

  login(provider: string) {
    let loginPromise: Promise<any>;
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
