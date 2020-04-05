import {Component, OnInit} from '@angular/core';

import {Platform} from '@ionic/angular';
import {SplashScreen} from '@ionic-native/splash-screen/ngx';
import {StatusBar} from '@ionic-native/status-bar/ngx';
import {AuthService} from './auth/auth.service';
import {Router} from '@angular/router';

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
  ];

  constructor(private platform: Platform,
              private splashScreen: SplashScreen,
              private statusBar: StatusBar,
              private authService: AuthService,
              private router: Router,) {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  ngOnInit() {
    const path = window.location.pathname.split('folder/')[1];
    if (path !== undefined) {
      this.selectedIndex = this.appPages.findIndex(page => page.title.toLowerCase() === path.toLowerCase());
    }
  }

  logout() {
    this.authService.doLogout().then(() => {
      this.router.navigateByUrl('/auth/login').then();
    });
  }
}
