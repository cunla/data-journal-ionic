import {scan, take, tap} from 'rxjs/operators';
import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {AngularFirestore, AngularFirestoreCollection} from '@angular/fire/compat/firestore';
import {AngularFireAuth} from '@angular/fire/compat/auth';


export interface BioResult {
  id: any;
  date: Date;
  type: string;
  value: number;
  metadata: any;
}

export const EMPTY_RESULT: BioResult = {
  id: null,
  date: null,
  type: '',
  value: 0,
  metadata: null,
};

@Injectable({
  providedIn: 'root'
})
export class BioService {
  // Observable data
  data: Observable<BioResult[]>;
  private _data = new BehaviorSubject([]);
  private path: string = 'bio-results';
  private readonly userId: string;


  constructor(public db: AngularFirestore,
              public afAuth: AngularFireAuth) {
    const user = JSON.parse(localStorage.getItem('user'));
    this.userId = user.uid;
    this.refresh();
  }

  get(key) {
    return this.userDoc().collection(this.path).doc(key).snapshotChanges();
  }

  update(key, value) {
    return this.userDoc().collection(this.path).doc(key).set(value);
  }

  delete(key) {
    return this.userDoc().collection(this.path).doc(key).delete();
  }

  create(date, type, value) {
    const record = {
      date: date,
      type: type,
      value: value,
    };
    console.log('Saving value: ', record);
    return this.userDoc().collection(this.path).add(record);
  }

  refresh() {
    const first = this.userDoc().collection(this.path, ref => {
      return this.queryFn(ref);
    });
    this.data = null;
    this._data = new BehaviorSubject([]);
    this.mapAndUpdate(first);
    // Create the observable array for consumption in components
    this.data = this._data.asObservable()
      .pipe(scan((acc, values) => {
        return values;
      }));
  }

  private queryFn(ref) {
    return ref;
  }

  // Determines the doc snapshot to paginate query
  private getCursor() {
    const current = this._data.value;
    if (current.length) {
      return current[current.length - 1].doc;
    }
    return null;
  }

  // Maps the snapshot to usable format the updates source
  private mapAndUpdate(col: AngularFirestoreCollection<any>) {
    // Map snapshot with doc ref (needed for cursor)
    return col.snapshotChanges().pipe(
      tap((arr: any) => {
        const values = arr.map(snap => {
          const data = snap.payload.doc.data();
          data.id = snap.payload.doc.id;
          const doc = snap.payload.doc;
          data.date = data.date ? data.date.toDate() : null;
          return {...data, doc};
        });

        // update source with new values, done loading
        this._data.next(values);
      }),
      take(1),)
      .subscribe();
  }

  private userDoc() {
    return this.db
      .collection('users')
      .doc(this.userId);
  }
}
