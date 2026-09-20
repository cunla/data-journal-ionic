import {TripInterface} from '../trips/trips.service';
import {AddressInterface} from '../addresses/address.service';
import {BioResult} from '../bloodresults/bio.service';
import {startOfDay} from './presence';

export const BACKUP_VERSION = 1;

export interface Backup {
  version: number;
  exportedAt: string;
  trips: unknown[];
  addresses: unknown[];
  bioResults: unknown[];
}

/** Trips touching [from, to] at all, not only those wholly inside it. */
export function tripsInRange(trips: TripInterface[], from: Date, to: Date): TripInterface[] {
  const first = startOfDay(from);
  const last = startOfDay(to);
  return trips.filter(trip => {
    if (!trip.start) {
      return false;
    }
    const start = startOfDay(trip.start);
    const end = trip.end ? startOfDay(trip.end) : startOfDay(new Date());
    return start <= last && end >= first;
  });
}

function plain(record: object, dateFields: string[]): Record<string, unknown> {
  const copy: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(record)) {
    if (key === 'metadata') {
      continue;   // derived from the reference-range file, not user data
    }
    copy[key] = dateFields.includes(key) && value instanceof Date
      ? value.toISOString()
      : value;
  }
  return copy;
}

/** Everything the account holds, with dates as ISO strings. */
export function buildBackup(trips: TripInterface[],
                            addresses: AddressInterface[],
                            bioResults: BioResult[],
                            exportedAt: Date = new Date()): Backup {
  return {
    version: BACKUP_VERSION,
    exportedAt: exportedAt.toISOString(),
    trips: trips.map(trip => plain(trip, ['start', 'end'])),
    addresses: addresses.map(address => plain(address, ['start', 'end'])),
    bioResults: bioResults.map(result => plain(result, ['date'])),
  };
}

/** A filename that sorts by date and says what it holds. */
export function backupFilename(exportedAt: Date = new Date()): string {
  return `data-journal-backup-${exportedAt.toISOString().slice(0, 10)}.json`;
}

export function rangeFilename(from: Date, to: Date): string {
  return `trips-${from.toISOString().slice(0, 10)}-to-${to.toISOString().slice(0, 10)}.csv`;
}
