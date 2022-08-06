import {Injectable} from '@angular/core';
import {AngularFireAuth} from '@angular/fire/compat/auth';
import {BehaviorSubject, Observable} from 'rxjs';
import firebase from "firebase/compat/app";

@Injectable()
export class AuthService {
  user: firebase.User;
  isLoginSubject = new BehaviorSubject<boolean>(this.isLoggedIn);

  constructor(public afAuth: AngularFireAuth) {
    this.afAuth.authState.subscribe(user => {
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
    return this.afAuth.signOut();
  }

  async resetPassword(email: string) {
    return this.afAuth.sendPasswordResetEmail(email);
  }

  private loginWithProvider(provider) {
    return this.afAuth.signInWithPopup(provider);
  }


}
