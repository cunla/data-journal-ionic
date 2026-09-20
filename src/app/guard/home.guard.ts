import {Injectable} from '@angular/core';
import {CanActivate, Router, UrlTree} from '@angular/router';
import {readStoredUser} from '../auth/stored-user';


@Injectable()
export class HomeGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean | UrlTree {
    if (readStoredUser() !== null) {
      return true;
    }
    return this.router.createUrlTree(['/auth/login']);
  }
}
