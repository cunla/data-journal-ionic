import {EnvironmentInjector, runInInjectionContext} from '@angular/core';
import {AngularFireAuth} from '@angular/fire/compat/auth';
import {AngularFirestore, AngularFirestoreCollection, DocumentData} from '@angular/fire/compat/firestore';
import {BehaviorSubject, Observable, Subscription} from 'rxjs';
import {map, tap} from 'rxjs/operators';

// Firestore hands timestamps back as Timestamp objects
export function toDate(value): Date | null {
  return value ? value.toDate() : null;
}

/**
 * Shared behaviour for the per-user collections under users/{uid}/.
 *
 * Holds one live listener on the signed-in user's documents, exposes them
 * through an observable that is never reassigned, and re-queries whenever the
 * signed-in user changes — so a logout or an account switch cannot leave the
 * previous user's data or id behind.
 */
export abstract class UserCollectionService<T> {
  // Stable subject and observable — never reassigned so async pipe stays subscribed
  protected readonly _data = new BehaviorSubject<T[]>([]);
  // Filtering happens here, on what is already loaded — searching never re-queries
  readonly data: Observable<T[]> = this._data.asObservable().pipe(
    map(values => values.filter(item => this.matches(item, this.searchValue)))
  );
  protected searchValue = '';
  private subscription: Subscription | null = null;
  // Follows the signed-in user; null while signed out
  private userId: string | null = null;

  protected constructor(protected readonly db: AngularFirestore,
                        protected readonly afAuth: AngularFireAuth,
                        protected readonly envInjector: EnvironmentInjector,
                        protected readonly path: string) {
    this.watchAuthState();
  }

  // Narrows the loaded records; no Firestore round trip
  search(searchValue: string) {
    this.searchValue = searchValue ?? '';
    this._data.next(this._data.value);
  }

  refresh() {
    // Cancel the previous live listener before starting a new one
    this.subscription?.unsubscribe();
    this.subscription = null;
    if (!this.userId) {
      this._data.next([]);
      return;
    }
    runInInjectionContext(this.envInjector, () => {
      this.listen(this.userDoc().collection(this.path,
        ref => this.orderBy ? ref.orderBy(this.orderBy, 'desc') : ref));
    });
  }

  get(key) {
    return runInInjectionContext(this.envInjector, () =>
      this.userDoc().collection(this.path).doc(key).snapshotChanges()
    );
  }

  update(key, value) {
    return runInInjectionContext(this.envInjector, () =>
      this.userDoc().collection(this.path).doc(key).set(value)
    );
  }

  delete(key) {
    return runInInjectionContext(this.envInjector, () =>
      this.userDoc().collection(this.path).doc(key).delete()
    );
  }

  create(value) {
    return runInInjectionContext(this.envInjector, () =>
      this.userDoc().collection(this.path).add(value)
    );
  }

  /** Turns one stored document into a record of this collection. */
  protected abstract toRecord(data: DocumentData, id: string): T;

  /** Field to order by, newest first; null leaves the order to Firestore. */
  protected readonly orderBy: string | null = null;

  /** Whether a record survives the current search term; every record by default. */
  protected matches(_item: T, _searchValue: string): boolean {
    return true;
  }

  private listen(col: AngularFirestoreCollection<DocumentData>) {
    this.subscription = col.snapshotChanges().pipe(
      tap(arr => this._data.next(
        arr.map(snap => this.toRecord(snap.payload.doc.data(), snap.payload.doc.id))))
    ).subscribe();
  }

  private watchAuthState() {
    runInInjectionContext(this.envInjector, () => {
      this.afAuth.authState.subscribe(user => {
        const userId = user?.uid ?? null;
        if (userId === this.userId) {
          return;
        }
        this.userId = userId;
        this.refresh();
      });
    });
  }

  private userDoc() {
    return this.db
      .collection('users')
      .doc(this.userId);
  }
}
