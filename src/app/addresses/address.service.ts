import {scan, take, tap} from 'rxjs/operators';
import {Injectable} from '@angular/core';
import {AngularFirestore, AngularFirestoreCollection, DocumentData} from '@angular/fire/compat/firestore';
import {BehaviorSubject, Observable} from 'rxjs';


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
  addresses: Array<AddressInterface> = null;
  // Observable data
  data: Observable<AddressInterface[]>;
  // Source data
  private _data = new BehaviorSubject([]);
  private query: QueryConfig;
  private readonly userId: string;

  constructor(public db: AngularFirestore,
              public afAuth: AngularFireAuth) {
    const user = JSON.parse(localStorage.getItem('user'));
    this.userId = user.uid;
    this.init(ADDRESS_HISTORY_PATH, 'start', {});
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
    this.data = null;
    this._data = new BehaviorSubject([]);
    if (this.addresses && this.addresses.length > 0) {
      this.mapAndUpdate(null);
    } else {
      const first = this.userDoc().collection(this.query.path, ref => {
        return this.queryFn(ref);
      });
      this.mapAndUpdate(first);
    }
    this.data = this._data.asObservable().pipe(
      scan((acc: AddressInterface[], values: AddressInterface[]) => {
        const val = values.filter((item: AddressInterface) => {
          return containsCaseInsensitive(item.locationName, this.query.searchValue);
        });
        return this.query.prepend ? val.concat(acc) : acc.concat(val);
      }));
  }

  get(key) {
    return this.userDoc().collection(this.query.path).doc(key).snapshotChanges();
  }

  update(key, value) {
    this.addresses = [];
    return this.userDoc().collection(this.query.path).doc(key).set(value);
  }

  delete(key) {
    this.addresses = [];
    return this.userDoc().collection(this.query.path).doc(key).delete();
  }

  create(value) {
    this.addresses = [];
    return this.userDoc().collection(this.query.path).add(value);
  }

  private mapAndUpdate(col: AngularFirestoreCollection<DocumentData>) {
    if (this.addresses && this.addresses.length > 0) {
      this._data.next(this.addresses);
    } else {
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
          values = this.query.prepend ? values.reverse() : values;
          this.addresses = values;
          this._data.next(values);
        }),
        take(1),)
        .subscribe();
    }
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
