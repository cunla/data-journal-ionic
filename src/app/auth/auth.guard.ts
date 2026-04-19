import {Injectable} from '@angular/core';
import {CanActivate, Router, UrlTree} from '@angular/router';
import {AuthService} from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(public auth: AuthService,
              private router: Router) {
  }

  canActivate(): boolean | UrlTree {
    if (this.auth.isLoggedIn) {
      return this.router.createUrlTree(['/trips']);
    }
    return true;
  }

}
