import {Component} from '@angular/core';
import {AuthService} from '../auth.service';
import {Router} from '@angular/router';
import {AlertController} from '@ionic/angular/lazy';
import {authErrorMessage} from '../auth-errors';

@Component({
    selector: 'app-login',
    templateUrl: './login-compo.component.html',
    styleUrls: ['./login-compo.component.scss'],
    standalone: false
})
export class LoginComponent {
  userEmail: string;
  userPassword: string;

  constructor(public authService: AuthService,
              private alertController: AlertController,
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
      default:
        return;
    }
    loginPromise.then(() => {
      if (this.authService.isLoggedIn) {
        this.router.navigateByUrl('/').then();
      }
    }).catch((error) => this.presentError(error));
  }

  private async presentError(error: { code?: string; message?: string }) {
    const message = authErrorMessage(error);
    if (!message) {
      return;
    }
    const alert = await this.alertController.create({
      header: 'Login failed',
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }
}
