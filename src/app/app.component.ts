import {Component, OnInit} from '@angular/core';

import {Platform} from '@ionic/angular';
import {SplashScreen} from '@ionic-native/splash-screen/ngx';
import {StatusBar} from '@ionic-native/status-bar/ngx';
import {AuthService} from './auth/auth.service';
import {NavigationEnd, Router} from '@angular/router';
import {Observable} from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent implements OnInit {
  public selectedIndex = 0;
  public appPages = [
    {
      title: 'Trips',
      url: '/trips',
      icon: 'paper-plane'
    },
    {
      title: 'Addresses',
      url: '/addresses',
      icon: 'mail'
    },
    {
      title: 'Map',
      url: '/map',
      icon: 'map'
    },
    {
      title: 'Blood results',
      url: '/bloodresults',
      icon: 'eyedrop'
    },
    {
      title: 'interviewing.io',
      url: '/iio',
      iconSource: '/assets/iio.svg'
    },
  ];
  loggedInSubject: Observable<boolean>;

  constructor(private platform: Platform,
              private splashScreen: SplashScreen,
              private statusBar: StatusBar,
              public authService: AuthService,
              private router: Router,) {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
    this.loggedInSubject = this.authService.loggedinSubject();
    this.loggedInSubject.subscribe((val) => {
      if (val) {
        const url = this.userLastUrl || '/trips';
        this.router.navigateByUrl(url).then();
      } else {
        this.router.navigateByUrl('/auth/login').then();
      }
    });
    router.events.subscribe(event => {
      if (event instanceof NavigationEnd && this.authService.isLoggedIn) {
        this.userLastUrl = event.url;
      }
    });
  }

  get userLastUrl(): string {
    return localStorage.getItem('userLastUrl');
  }

  set userLastUrl(lastUrl: string) {
    localStorage.setItem('userLastUrl', lastUrl);
  }

  ngOnInit() {
  }

  logout() {
    this.authService.doLogout().then(() => {
    });
  }
}
