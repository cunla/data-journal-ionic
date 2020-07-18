import {Injectable} from '@angular/core';
import {AngularFireAuth} from '@angular/fire/auth';
import * as firebase from 'firebase/app';
import {BehaviorSubject, Observable} from 'rxjs';

@Injectable()
export class AuthService {
  user: firebase.User;
  isLoginSubject = new BehaviorSubject<boolean>(this.isLoggedIn);

  constructor(public auth: AngularFireAuth) {
    this.auth.authState.subscribe(user => {
      if (user) {
        this.user = user;
        localStorage.setItem('user', JSON.stringify(this.user));
        this.isLoginSubject.next(true);
      } else {
        localStorage.setItem('user', null);
        this.isLoginSubject.next(false);
      }
    });
  }

  get isLoggedIn(): boolean {
    const user = JSON.parse(localStorage.getItem('user'));
    return user !== null;
  }

  get userId() {
    const user = JSON.parse(localStorage.getItem('user'));
    return user.uid;
  }

  get userEmail() {
    const user = JSON.parse(localStorage.getItem('user'));
    return user ? user.email : '';
  }

  loggedinSubject(): Observable<boolean> {
    return this.isLoginSubject.asObservable();
  }

  doFacebookLogin() {
    return this.loginWithProvider(new firebase.auth.FacebookAuthProvider());
  }

  doTwitterLogin() {
    return this.loginWithProvider(new firebase.auth.TwitterAuthProvider());
  }

  doGoogleLogin() {
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope('profile');
    provider.addScope('email');
    return this.loginWithProvider(provider);
  }

  doRegister(email: string, password: string) {
    return firebase.auth().createUserWithEmailAndPassword(email, password);
  }

  doEmailLogin(email: string, password: string) {
    return firebase.auth().signInWithEmailAndPassword(email, password);
  }

  doLogout() {
    localStorage.setItem('user', null);
    return this.auth.signOut();
  }

  async resetPassword(email: string) {
    return this.auth.sendPasswordResetEmail(email);
  }

  private loginWithProvider(provider) {
    return this.auth.signInWithPopup(provider);
  }


}
