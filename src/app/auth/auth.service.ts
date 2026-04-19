import { inject, Injectable } from '@angular/core';
import {
  Auth,
  AuthProvider,
  createUserWithEmailAndPassword,
  FacebookAuthProvider,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  TwitterAuthProvider,
  User,
} from '@angular/fire/auth';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable()
export class AuthService {
  private auth = inject(Auth);
  user: User | null = null;
  isLoginSubject = new BehaviorSubject<boolean>(this.isLoggedIn);

  constructor() {
    onAuthStateChanged(this.auth, user => {
      if (user) {
        this.user = user;
        localStorage.setItem('user', JSON.stringify(user));
        this.isLoginSubject.next(true);
      } else {
        localStorage.removeItem('user');
        this.isLoginSubject.next(false);
      }
    });
  }

  get isLoggedIn(): boolean {
    const user = JSON.parse(localStorage.getItem('user'));
    return user !== null;
  }

  get userId(): string | null {
    const user = JSON.parse(localStorage.getItem('user'));
    return user?.uid ?? null;
  }

  get userEmail() {
    const user = JSON.parse(localStorage.getItem('user'));
    return user ? user.email : '';
  }

  loggedinSubject(): Observable<boolean> {
    return this.isLoginSubject.asObservable();
  }

  doFacebookLogin() {
    return this.loginWithProvider(new FacebookAuthProvider());
  }

  doTwitterLogin() {
    return this.loginWithProvider(new TwitterAuthProvider());
  }

  doGoogleLogin() {
    const provider = new GoogleAuthProvider();
    provider.addScope('profile');
    provider.addScope('email');
    return this.loginWithProvider(provider);
  }

  doRegister(email: string, password: string) {
    return createUserWithEmailAndPassword(this.auth, email, password);
  }

  doEmailLogin(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  doLogout() {
    localStorage.setItem('user', null);
    return signOut(this.auth);
  }

  async resetPassword(email: string) {
    return sendPasswordResetEmail(this.auth, email);
  }

  private loginWithProvider(provider: AuthProvider) {
    return signInWithPopup(this.auth, provider);
  }
}
