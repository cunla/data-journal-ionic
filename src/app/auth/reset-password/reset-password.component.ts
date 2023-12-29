import {Component} from '@angular/core';
import {AuthService} from '../auth.service';
import {AlertController} from '@ionic/angular';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
})
export class ResetPasswordComponent {
  userEmail: string;

  constructor(private authService: AuthService,
              private alertController: AlertController) {
  }

  resetPassword(email: string) {
    this.authService.resetPassword(email)
      .then(() => this.presentAlert('sent Password Reset Email!'))
      .catch((error) => this.presentAlert(error));
  }

  async presentAlert(msg: string) {
    const alert = await this.alertController.create({
      header: 'Reset password',
      message: msg,
      buttons: ['OK']
    });

    await alert.present();
  }

}
