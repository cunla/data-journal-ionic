import {Component} from '@angular/core';
import {AuthService} from '../auth.service';
import {AlertController} from '@ionic/angular/lazy';
import {authErrorMessage} from '../auth-errors';

@Component({
    selector: 'app-signup',
    templateUrl: './signup.component.html',
    styleUrls: ['./signup.component.scss'],
    standalone: false
})
export class SignupComponent {
  userEmail: string;
  userPassword: string;

  constructor(public authService: AuthService,
              private alertController: AlertController,) {
  }

  signupWithEmail() {
    this.authService.doRegister(this.userEmail, this.userPassword)
      .catch((error) => this.presentError(error));
  }

  signupWithGoogle() {
    this.authService.doGoogleLogin()
      .catch((error) => this.presentError(error));
  }

  private async presentError(error: { code?: string; message?: string }) {
    const message = authErrorMessage(error);
    if (!message) {
      return;
    }
    const alert = await this.alertController.create({
      header: 'Sign up failed',
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }
}
