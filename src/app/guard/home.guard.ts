import {Injectable} from '@angular/core';
import {CanActivate, Router} from '@angular/router';


@Injectable()
export class HomeGuard implements CanActivate {
  private userId: string;

  constructor(private router: Router) {
    const user = JSON.parse(localStorage.getItem('user'));
    this.userId = user ? user.uid : null;
  }

  canActivate(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (this.userId !== null) {
        resolve(true);
      } else {
        this.router.navigateByUrl('/auth/login').then();
        resolve(false);
      }
    });
  }
}
