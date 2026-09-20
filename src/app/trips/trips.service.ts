import {tap} from 'rxjs/operators';
import {EnvironmentInjector, Injectable, runInInjectionContext} from '@angular/core';
import {AngularFirestore, AngularFirestoreCollection, DocumentChangeAction, DocumentData} from '@angular/fire/compat/firestore';
import {BehaviorSubject, Observable, Subscription} from 'rxjs';
import {AngularFireAuth} from '@angular/fire/compat/auth';
import {containsCaseInsensitive} from '../common/string.tools';

export interface QueryConfig {
  path: string; //  path to collection
  field: string; // field to orderBy
  reverse: boolean; // reverse order?
  prepend: boolean; // prepend to source?
  searchValue: string;
  filter: boolean;
}

export interface TripInterface {
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
  purpose: string;
}

export const EMPTY_TRIP: TripInterface = {
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
  purpose: '',
};

@Injectable({
  providedIn: 'root'
})
export class TripsService {
  private trips: Array<TripInterface> = null;
  // Stable subject and observable — never reassigned so async pipe stays subscribed
  private readonly _data = new BehaviorSubject<TripInterface[]>([]);
  readonly data: Observable<TripInterface[]> = this._data.asObservable();
  private _subscription: Subscription | null = null;

  private _done = new BehaviorSubject(false);
  done: Observable<boolean> = this._done.asObservable();
  private _loading = new BehaviorSubject(false);
  loading: Observable<boolean> = this._loading.asObservable();

  private query: QueryConfig;
  // Follows the signed-in user; null while signed out
  private userId: string | null = null;


  constructor(public db: AngularFirestore,
              public afAuth: AngularFireAuth,
              private envInjector: EnvironmentInjector) {
    this.init('trips', 'start', {reverse: true, prepend: false});
    this.watchAuthState();
  }

  // Initial query sets options and defines the Observable
  // passing opts will override the defaults
  init(path: string, field: string, opts?: { reverse: boolean, prepend: boolean, searchValue?: string }) {
    this.query = {
      path: path,
      field: field,
      reverse: true,
      prepend: false,
      searchValue: '',
      filter: true,
      ...opts
    };
    this.refresh();
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

  refresh() {
    this._done.next(false);
    this._loading.next(false);
    this._data.next([]);
    if (!this.userId) {
      this._subscription?.unsubscribe();
      this._subscription = null;
      this.trips = null;
      return;
    }
    runInInjectionContext(this.envInjector, () => {
      this.mapAndUpdate(this.userDoc().collection(this.query.path, ref => this.queryFn(ref)));
    });
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


  private queryFn(ref) {
    // No limit: the list, search, CSV export and map all read this stream
    return ref
      .orderBy(this.query.field, this.query.reverse ? 'desc' : 'asc');
  }

  // Maps the snapshot to usable format then updates source
  private mapAndUpdate(col: AngularFirestoreCollection<DocumentData>) {
    // Cancel the previous live listener before starting a new one
    this._subscription?.unsubscribe();
    this._loading.next(true);

    this._subscription = col.snapshotChanges().pipe(
      tap((arr: DocumentChangeAction<DocumentData>[]) => {
        let values = arr.map(snap => {
          const data = snap.payload.doc.data();
          data['id'] = snap.payload.doc.id;
          const doc = snap.payload.doc;
          data['start'] = data['start'] ? data['start'].toDate() : null;
          data['end'] = data['end'] ? data['end'].toDate() : null;
          return {...data, doc} as unknown as TripInterface;
        });

        values = this.query.prepend ? values.reverse() : values;
        this.trips = values;
        this._loading.next(false);
        this._done.next(!values.length);

        // Apply search filter and push — stable _data reference keeps async pipe subscribed
        this._data.next(values.filter(item =>
          containsCaseInsensitive(item.locationName, this.query.searchValue) ||
          containsCaseInsensitive(item.purpose, this.query.searchValue)
        ));
      })
    ).subscribe();
  }

  private userDoc() {
    return this.db
      .collection('users')
      .doc(this.userId);
  }

  public getTrips(): Array<TripInterface> {
    if (!this.trips) {
      this.refresh();
    }
    return this.trips;
  }
}
