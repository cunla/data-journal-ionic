import {EnvironmentInjector, Injectable} from '@angular/core';
import {AngularFirestore, DocumentData} from '@angular/fire/compat/firestore';
import {AngularFireAuth} from '@angular/fire/compat/auth';
import {BioResultMeta} from "./bio-metadata.service";
import {toDate, UserCollectionService} from '../common/user-collection.service';


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
export class BioService extends UserCollectionService<BioResult> {
  constructor(db: AngularFirestore,
              afAuth: AngularFireAuth,
              envInjector: EnvironmentInjector) {
    super(db, afAuth, envInjector, 'bio-results');
  }

  createResult(date, type, value) {
    return this.create({date, type, value});
  }

  protected toRecord(data: DocumentData, id: string): BioResult {
    return {
      ...data,
      id,
      date: toDate(data['date']),
    } as unknown as BioResult;
  }
}
