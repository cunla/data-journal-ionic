import {EnvironmentInjector, Injectable} from '@angular/core';
import {AngularFirestore, DocumentData} from '@angular/fire/compat/firestore';
import {AngularFireAuth} from '@angular/fire/compat/auth';
import {containsCaseInsensitive} from '../common/string.tools';
import {toDate, UserCollectionService} from '../common/user-collection.service';

export const ADDRESS_HISTORY_PATH = 'address-history';

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
export class AddressService extends UserCollectionService<AddressInterface> {
  constructor(db: AngularFirestore,
              afAuth: AngularFireAuth,
              envInjector: EnvironmentInjector) {
    super(db, afAuth, envInjector, ADDRESS_HISTORY_PATH);
  }

  protected override readonly orderBy = 'start';

  protected toRecord(data: DocumentData, id: string): AddressInterface {
    return {
      ...data,
      id,
      start: toDate(data['start']),
      end: toDate(data['end']),
    } as unknown as AddressInterface;
  }

  protected override matches(item: AddressInterface, searchValue: string): boolean {
    return containsCaseInsensitive(item.locationName, searchValue);
  }
}
