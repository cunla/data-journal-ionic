
import {take, tap, scan} from 'rxjs/operators';
import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {AngularFirestore, AngularFirestoreCollection} from '@angular/fire/firestore';
import {AngularFireAuth} from '@angular/fire/auth';




export interface BioResult {
  id: any;
  date: Date;
  type: string;
  value: number;
}

export const EMPTY_RESULT: BioResult = {
  id: null,
  date: new Date(),
  type: '',
  value: 0,
}

@Injectable({
  providedIn: 'root'
})
export class BioService {
  // Observable data
  data: Observable<BioResult[]>;
  // Source data
  private _done = new BehaviorSubject(false);
  done: Observable<boolean> = this._done.asObservable();
  private _loading = new BehaviorSubject(false);
  loading: Observable<boolean> = this._loading.asObservable();
  private _data = new BehaviorSubject([]);
  private path: string='bio-results';
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

  create(value) {
    return this.userDoc().collection(this.path).add(value);
  }

  refresh() {
    const first = this.userDoc().collection(this.path, ref => {
      return this.queryFn(ref);
    });
    this.data = null;
    this._done.next(false);
    this._loading.next(false);
    this._data = new BehaviorSubject([]);
    this.mapAndUpdate(first);
    // Create the observable array for consumption in components
    this.data = this._data.asObservable().pipe(scan((acc, values) => {
      return values.concat(acc);
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
    if (this._done.value || this._loading.value) {
      return;
    }
    // loading
    this._loading.next(true);
    // Map snapshot with doc ref (needed for cursor)
    return col.snapshotChanges().pipe(
    tap(arr => {
      let values = arr.map(snap => {
        const data = snap.payload.doc.data();
        data.id = snap.payload.doc.id;
        const doc = snap.payload.doc;
        data.date = data.date ? data.date.toDate() : null;
        return {...data, doc};
      });

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
}
