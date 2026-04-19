import {Injectable} from '@angular/core';
import {CanActivate, Router, UrlTree} from '@angular/router';


@Injectable()
export class HomeGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean | UrlTree {
    const user = JSON.parse(localStorage.getItem('user'));
    const userId: string | null = user?.uid ?? null;
    if (userId !== null) {
      return true;
    }
    return this.router.createUrlTree(['/auth/login']);
  }
}
