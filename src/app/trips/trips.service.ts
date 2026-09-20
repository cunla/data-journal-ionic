import {EnvironmentInjector, Injectable} from '@angular/core';
import {AngularFirestore, DocumentData} from '@angular/fire/compat/firestore';
import {AngularFireAuth} from '@angular/fire/compat/auth';
import {containsCaseInsensitive} from '../common/string.tools';
import {toDate, UserCollectionService} from '../common/user-collection.service';

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
export class TripsService extends UserCollectionService<TripInterface> {
  constructor(db: AngularFirestore,
              afAuth: AngularFireAuth,
              envInjector: EnvironmentInjector) {
    super(db, afAuth, envInjector, 'trips');
  }

  protected override readonly orderBy = 'start';

  protected toRecord(data: DocumentData, id: string): TripInterface {
    return {
      ...data,
      id,
      start: toDate(data['start']),
      end: toDate(data['end']),
    } as unknown as TripInterface;
  }

  protected override matches(item: TripInterface, searchValue: string): boolean {
    return containsCaseInsensitive(item.locationName, searchValue)
      || containsCaseInsensitive(item.purpose, searchValue);
  }
}
