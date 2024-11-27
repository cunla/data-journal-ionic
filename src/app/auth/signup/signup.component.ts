import {Component} from '@angular/core';
import {AuthService} from '../auth.service';

@Component({
    selector: 'app-signup',
    templateUrl: './signup.component.html',
    styleUrls: ['./signup.component.scss'],
    standalone: false
})
export class SignupComponent {
  userEmail: string;
  userPassword: string;

  constructor(public authService: AuthService,) {
  }


}
