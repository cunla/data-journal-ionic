import {tap} from 'rxjs/operators';
import {EnvironmentInjector, Injectable, runInInjectionContext} from '@angular/core';
import {BehaviorSubject, Observable, Subscription} from 'rxjs';
import {AngularFirestore, AngularFirestoreCollection, DocumentData} from '@angular/fire/compat/firestore';
import {AngularFireAuth} from '@angular/fire/compat/auth';
import {BioResultMeta} from "./bio-metadata.service";


export interface BioResult {
  id: string;
  date: Date;
  type: string;
  value: number;
  metadata: BioResultMeta;
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
  // Stable subject and observable — never reassigned so subscribers stay attached
  private readonly _data = new BehaviorSubject<BioResult[]>([]);
  readonly data: Observable<BioResult[]> = this._data.asObservable();
  private _subscription: Subscription | null = null;
  private path: string = 'bio-results';
  private readonly userId: string;


  constructor(public db: AngularFirestore,
              public afAuth: AngularFireAuth,
              private envInjector: EnvironmentInjector) {
    const user = JSON.parse(localStorage.getItem('user'));
    this.userId = user.uid;
    this.refresh();
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

  create(date, type, value) {
    const record = {
      date: date,
      type: type,
      value: value,
    };
    console.log('Saving value: ', record);
    return runInInjectionContext(this.envInjector, () =>
      this.userDoc().collection(this.path).add(record)
    );
  }

  refresh() {
    runInInjectionContext(this.envInjector, () => {
      this.mapAndUpdate(this.userDoc().collection(this.path));
    });
  }

  // Maps the snapshot to usable format then updates source
  private mapAndUpdate(col: AngularFirestoreCollection<DocumentData>) {
    // Cancel the previous live listener before starting a new one
    this._subscription?.unsubscribe();

    this._subscription = col.snapshotChanges().pipe(
      tap((arr) => {
        const values = arr.map(snap => {
          const data = snap.payload.doc.data();
          data.id = snap.payload.doc.id;
          const doc = snap.payload.doc;
          data.date = data.date ? data.date.toDate() : null;
          return {...data, doc} as unknown as BioResult;
        });

        // update source with new values, done loading
        this._data.next(values);
      }))
      .subscribe();
  }

  private userDoc() {
    return this.db
      .collection('users')
      .doc(this.userId);
  }
}
