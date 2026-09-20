import {TripInterface} from '../trips/trips.service';
import {AddressInterface} from '../addresses/address.service';

export interface Point {
  lon: number;
  id: string;
  year: number;
  lat: number;
  title?: string;
  content?: HTMLElement;
}

export function itemToPoint(item: TripInterface | AddressInterface): Point {
  return item ? {
    id: item.city,
    lon: +item.lng,
    lat: +item.lat,
    year: item.start.getFullYear(),
  } : null;
}

/**
 * Where the trip at `tripInd` started from: the trip already under way if its
 * dates overlap, otherwise the address lived at on that date. Pass -1 for
 * `tripInd` to ask where the traveller is today.
 */
export function getOriginPointOnDate(trips: TripInterface[],
                                     addresses: AddressInterface[],
                                     tripInd: number): Point {
  const date = tripInd == -1 ? new Date() : trips[tripInd].start;
  if (trips.length > 0) {
    let low = 0, high = trips.length - 1;
    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      if (mid == tripInd && tripInd > 0 && trips[tripInd - 1].start <= date && date <= trips[tripInd - 1].end) {
        return itemToPoint(trips[tripInd - 1]);
      } else if (date < trips[mid].start) {
        high = mid - 1;
      } else if (trips[mid].end < date) {
        low = mid + 1;
      } else if (mid != tripInd && trips[mid].start <= date && date <= trips[mid].end) {
        return itemToPoint(trips[mid]);
      } else {
        break;
      }
    }
  }
  let ind = 0;
  while (ind < addresses.length) {
    if (addresses[ind].start <= date &&
      (!addresses[ind].end || addresses[ind].end >= date)) {
      return itemToPoint(addresses[ind]);
    }
    ++ind;
  }
  return null;
}
