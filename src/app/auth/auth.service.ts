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
  User,
} from '@angular/fire/auth';
import { BehaviorSubject, Observable } from 'rxjs';
import { readStoredUser, writeStoredUser } from './stored-user';

@Injectable()
export class AuthService {
  private auth = inject(Auth);
  user: User | null = null;
  isLoginSubject = new BehaviorSubject<boolean>(this.isLoggedIn);

  constructor() {
    onAuthStateChanged(this.auth, user => {
      if (user) {
        this.user = user;
        writeStoredUser(user);
        this.isLoginSubject.next(true);
      } else {
        this.user = null;
        writeStoredUser(null);
        this.isLoginSubject.next(false);
      }
    });
  }

  get isLoggedIn(): boolean {
    return readStoredUser() !== null;
  }

  get userId(): string | null {
    return readStoredUser()?.uid ?? null;
  }

  get userEmail() {
    return readStoredUser()?.email ?? '';
  }

  loggedinSubject(): Observable<boolean> {
    return this.isLoginSubject.asObservable();
  }

  doFacebookLogin() {
    return this.loginWithProvider(new FacebookAuthProvider());
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
    writeStoredUser(null);
    return signOut(this.auth);
  }

  async resetPassword(email: string) {
    return sendPasswordResetEmail(this.auth, email);
  }

  private loginWithProvider(provider: AuthProvider) {
    return signInWithPopup(this.auth, provider);
  }
}
