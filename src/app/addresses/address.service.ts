import {map, tap} from 'rxjs/operators';
import {EnvironmentInjector, Injectable, runInInjectionContext} from '@angular/core';
import {AngularFirestore, AngularFirestoreCollection, DocumentChangeAction, DocumentData} from '@angular/fire/compat/firestore';
import {BehaviorSubject, Observable, Subscription} from 'rxjs';


import {AngularFireAuth} from '@angular/fire/compat/auth';
import {containsCaseInsensitive} from '../common/string.tools';

export const ADDRESS_HISTORY_PATH = 'address-history';

export interface QueryConfig {
  path: string; //  path to collection
  field: string; // field to orderBy
  reverse: boolean; // reverse order?
  prepend: boolean; // prepend to source?
  searchValue: string;
  filter: boolean;
}

export interface AddressInterface {
  id: number;
  start: Date;
  end: Date;
  locationName: string;
  city: string;
  state: string;
  country: string;
  countryCode: string;
  lat: number;
  lng: number;
  address: string;
}

export const EMPTY_ADDRESS: AddressInterface = {
  id: null,
  start: null,
  end: null,
  locationName: '',
  city: null,
  state: null,
  country: null,
  countryCode: null,
  lat: null,
  lng: null,
  address: '',
};

@Injectable({
  providedIn: 'root'
})
export class AddressService {
  // Stable subject and observable — never reassigned so async pipe stays subscribed
  private readonly _data = new BehaviorSubject<AddressInterface[]>([]);
  readonly data: Observable<AddressInterface[]> = this._data.asObservable().pipe(
    map(values => values.filter(item =>
      containsCaseInsensitive(item.locationName, this.query.searchValue)))
  );
  private _subscription: Subscription | null = null;
  private query: QueryConfig;
  // Follows the signed-in user; null while signed out
  private userId: string | null = null;

  constructor(public db: AngularFirestore,
              public afAuth: AngularFireAuth,
              private envInjector: EnvironmentInjector) {
    this.init(ADDRESS_HISTORY_PATH, 'start', {});
    this.watchAuthState();
  }

  init(path: string, field: string, opts?: { reverse?: boolean, prepend?: boolean, searchValue?: string, }) {
    this.query = {
      path,
      field,
      reverse: true,
      prepend: false,
      searchValue: '',
      filter: true,
      ...opts
    };
    this.refresh();
  }

  refresh() {
    // Cancel the previous live listener before starting a new one
    this._subscription?.unsubscribe();
    this._subscription = null;
    if (!this.userId) {
      this._data.next([]);
      return;
    }
    runInInjectionContext(this.envInjector, () => {
      this.mapAndUpdate(this.userDoc().collection(this.query.path, ref => this.queryFn(ref)));
    });
  }

  get(key) {
    return runInInjectionContext(this.envInjector, () =>
      this.userDoc().collection(this.query.path).doc(key).snapshotChanges()
    );
  }

  update(key, value) {
    return runInInjectionContext(this.envInjector, () =>
      this.userDoc().collection(this.query.path).doc(key).set(value)
    );
  }

  delete(key) {
    return runInInjectionContext(this.envInjector, () =>
      this.userDoc().collection(this.query.path).doc(key).delete()
    );
  }

  create(value) {
    return runInInjectionContext(this.envInjector, () =>
      this.userDoc().collection(this.query.path).add(value)
    );
  }

  // Re-queries as the signed-in user changes, so a logout or an account
  // switch never leaves the previous user's data or id in place
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

  private mapAndUpdate(col: AngularFirestoreCollection<DocumentData>) {
    this._subscription = col.snapshotChanges().pipe(
      tap((arr: DocumentChangeAction<DocumentData>[]) => {
        let values = arr.map(snap => {
          const data = snap.payload.doc.data();
          data['id'] = snap.payload.doc.id;
          const doc = snap.payload.doc;
          data['start'] = data['start'] ? data['start'].toDate() : null;
          data['end'] = data['end'] ? data['end'].toDate() : null;
          return {...data, doc} as unknown as AddressInterface;
        });
        values = this.query.prepend ? values.reverse() : values;
        this._data.next(values);
      }))
      .subscribe();
  }

  private queryFn(ref) {
    return ref.orderBy(this.query.field, this.query.reverse ? 'desc' : 'asc');
  }

  private userDoc() {
    return this.db
      .collection('users')
      .doc(this.userId);
  }
}
