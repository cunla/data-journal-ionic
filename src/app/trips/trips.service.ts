import {tap} from 'rxjs/operators';
import {EnvironmentInjector, Injectable, runInInjectionContext} from '@angular/core';
import {AngularFirestore, AngularFirestoreCollection, DocumentChangeAction, DocumentData} from '@angular/fire/compat/firestore';
import {BehaviorSubject, Observable, Subscription} from 'rxjs';
import {AngularFireAuth} from '@angular/fire/compat/auth';
import {containsCaseInsensitive} from '../common/string.tools';

export interface QueryConfig {
  path: string; //  path to collection
  field: string; // field to orderBy
  limit: number; // limit per query
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
  private readonly userId: string;


  constructor(public db: AngularFirestore,
              public afAuth: AngularFireAuth,
              private envInjector: EnvironmentInjector) {
    const user = JSON.parse(localStorage.getItem('user'));
    this.userId = user.uid;
    this.init('trips', 'start', {reverse: true, prepend: false});
  }

  // Initial query sets options and defines the Observable
  // passing opts will override the defaults
  init(path: string, field: string, opts?: { reverse: boolean, prepend: boolean, searchValue?: string }) {
    this.query = {
      path: path,
      field: field,
      limit: 50,
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
    runInInjectionContext(this.envInjector, () => {
      const first = this.userDoc().collection(this.query.path, ref => this.queryFn(ref));
      this._done.next(false);
      this._loading.next(false);
      this._data.next([]);
      this.mapAndUpdate(first);
    });
  }

  private queryFn(ref) {
    return ref
      .orderBy(this.query.field, this.query.reverse ? 'desc' : 'asc')
      .limit(this.query.limit);
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
