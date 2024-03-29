import {scan, take, tap} from 'rxjs/operators';
import {Injectable} from '@angular/core';
import {AngularFirestore, AngularFirestoreCollection, DocumentData} from '@angular/fire/compat/firestore';
import {BehaviorSubject, Observable} from 'rxjs';
// import * as firebase from 'firebase/compat/app';
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
  // Observable data
  private trips: Array<TripInterface> = null;
  data: Observable<TripInterface[]>;
  // Source data
  private _done = new BehaviorSubject(false);
  done: Observable<boolean> = this._done.asObservable();
  private _loading = new BehaviorSubject(false);
  loading: Observable<boolean> = this._loading.asObservable();
  private _data = new BehaviorSubject([]);
  private query: QueryConfig;
  private readonly userId: string;


  constructor(public db: AngularFirestore,
              public afAuth: AngularFireAuth) {
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

  // Retrieves additional data from firestore
  more() {
    const cursor = this.getCursor();
    const more = this.userDoc().collection(this.query.path, ref => {
      return this.queryFn(ref).startAfter(cursor);
    });
    this.mapAndUpdate(more);
  }

  get(key) {
    return this.userDoc().collection(this.query.path).doc(key).snapshotChanges();
  }

  update(key, value) {
    return this.userDoc().collection(this.query.path).doc(key).set(value);
  }

  delete(key) {
    return this.userDoc().collection(this.query.path).doc(key).delete();
  }

  create(value) {
    return this.userDoc().collection(this.query.path).add(value);
  }

  refresh() {
    console.log('trips refresh ', this.query.path);
    const first = this.userDoc().collection(this.query.path, ref => {
      return this.queryFn(ref);
    });
    this.data = null;
    this._done.next(false);
    this._loading.next(false);
    this._data = new BehaviorSubject([]);
    this.mapAndUpdate(first);
    // Create the observable array for consumption in components
    this.data = this._data.asObservable()
      .pipe(scan((acc: TripInterface[], values: TripInterface[]) => {
        const val = values.filter((item: TripInterface) => {
          return containsCaseInsensitive(item.locationName, this.query.searchValue)
            || containsCaseInsensitive(item.purpose, this.query.searchValue);
        });
        return this.query.prepend ? val.concat(acc) : acc.concat(val);
      }));
  }

  private queryFn(ref) {
    return ref
      .orderBy(this.query.field, this.query.reverse ? 'desc' : 'asc')
      .limit(this.query.limit);
  }

  // Determines the doc snapshot to paginate query
  private getCursor() {
    const current = this._data.value;
    if (current.length) {
      return this.query.prepend ? current[0].doc : current[current.length - 1].doc;
    }
    return null;
  }

  // Maps the snapshot to usable format the updates source
  private mapAndUpdate(col: AngularFirestoreCollection<DocumentData>) {
    if (this._done.value || this._loading.value) {
      return;
    }
    // loading
    this._loading.next(true);
    // Map snapshot with doc ref (needed for cursor)
    return col.snapshotChanges().pipe(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tap((arr: any) => {
        let values = arr.map(snap => {
          const data = snap.payload.doc.data();
          data.id = snap.payload.doc.id;
          const doc = snap.payload.doc;
          data.start = data.start ? data.start.toDate() : null;
          data.end = data.end ? data.end.toDate() : null;
          return {...data, doc};
        });

        // If prepending, reverse the batch order
        values = this.query.prepend ? values.reverse() : values;

        this.trips = values;
        // update source with new values, done loading
        this._data.next(values);
        this._loading.next(false);

        // no more values, mark done
        if (!values.length) {
          this._done.next(true);
        }
      }),
      take(1),)
      .subscribe();
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
