import {DateTime} from 'luxon';
import {CsvTools} from '../common/csvtools.service';
import {TripInterface} from './trips.service';

export interface ImportResult {
  trips: Partial<TripInterface>[];
  /** One message per row that could not be used, in file order. */
  skipped: string[];
}

// Header spellings accepted for each field, lower-cased and stripped of spaces
const FIELDS: Record<string, string[]> = {
  start: ['start', 'startdate', 'from', 'departure'],
  end: ['end', 'enddate', 'to', 'return'],
  locationName: ['locationname', 'location', 'place', 'destination'],
  purpose: ['purpose', 'reason', 'notes'],
  city: ['city', 'town'],
  state: ['state', 'province', 'region'],
  country: ['country'],
  countryCode: ['countrycode', 'iso2', 'code'],
  lat: ['lat', 'latitude'],
  lng: ['lng', 'lon', 'long', 'longitude'],
};

function normalise(header: string): string {
  return header.toLowerCase().replace(/[\s_-]/g, '');
}

function parseDate(value: string): Date | null {
  if (!value) {
    return null;
  }
  const iso = DateTime.fromISO(value);
  if (iso.isValid) {
    return iso.toJSDate();
  }
  for (const format of ['yyyy-MM-dd', 'dd/MM/yyyy', 'MM/dd/yyyy', 'yyyy/MM/dd']) {
    const parsed = DateTime.fromFormat(value, format);
    if (parsed.isValid) {
      return parsed.toJSDate();
    }
  }
  return null;
}

function parseNumber(value: string): number | null {
  if (!value) {
    return null;
  }
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

/**
 * Reads exported or hand-written CSV into trips ready to save. The header row
 * decides which column is which, so column order does not matter and unknown
 * columns (such as the Line# this app exports) are ignored. A row needs at
 * least a start date and somewhere it went.
 */
export function parseTripsCsv(text: string): ImportResult {
  const rows = CsvTools.parseCsv(text);
  if (!rows.length) {
    return {trips: [], skipped: ['The file is empty.']};
  }
  const headers = rows[0].map(normalise);
  const columns = new Map<string, number>();
  for (const [field, spellings] of Object.entries(FIELDS)) {
    const index = headers.findIndex(header => spellings.includes(header));
    if (index >= 0) {
      columns.set(field, index);
    }
  }
  if (!columns.has('start')) {
    return {trips: [], skipped: ['No start date column found. Expected a column named start.']};
  }

  const trips: Partial<TripInterface>[] = [];
  const skipped: string[] = [];
  const value = (row: string[], field: string): string =>
    columns.has(field) ? (row[columns.get(field)] ?? '').trim() : '';

  rows.slice(1).forEach((row, index) => {
    const line = index + 2;   // the file's own line number, header included
    const start = parseDate(value(row, 'start'));
    if (!start) {
      skipped.push(`Line ${line}: no usable start date.`);
      return;
    }
    const end = parseDate(value(row, 'end'));
    if (end && end < start) {
      skipped.push(`Line ${line}: ends before it starts.`);
      return;
    }
    const locationName = value(row, 'locationName') || value(row, 'city');
    if (!locationName) {
      skipped.push(`Line ${line}: no location.`);
      return;
    }
    trips.push({
      start,
      end,
      locationName,
      purpose: value(row, 'purpose') || '',
      city: value(row, 'city') || null,
      state: value(row, 'state') || null,
      country: value(row, 'country') || null,
      countryCode: value(row, 'countryCode')?.toUpperCase() || null,
      lat: parseNumber(value(row, 'lat')),
      lng: parseNumber(value(row, 'lng')),
    });
  });
  return {trips, skipped};
}
