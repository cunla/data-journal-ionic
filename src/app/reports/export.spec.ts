import {describe, expect, it} from 'vitest';
import {TripInterface} from '../trips/trips.service';
import {AddressInterface} from '../addresses/address.service';
import {BioResult} from '../bloodresults/bio.service';
import {backupFilename, buildBackup, rangeFilename, tripsInRange} from './export';

const trip = (name: string, start: string, end: string | null): TripInterface => ({
  ...({} as TripInterface), locationName: name,
  start: new Date(start), end: end ? new Date(end) : null,
});

describe('tripsInRange', () => {
  const trips = [
    trip('before', '2023-01-01', '2023-01-10'),
    trip('overlapping start', '2023-12-20', '2024-01-05'),
    trip('inside', '2024-06-01', '2024-06-10'),
    trip('overlapping end', '2024-12-28', '2025-01-04'),
    trip('after', '2025-05-01', '2025-05-10'),
  ];
  const kept = tripsInRange(trips, new Date('2024-01-01'), new Date('2024-12-31'))
    .map(t => t.locationName);

  it('keeps trips that touch the range at either end', () => {
    expect(kept).toEqual(['overlapping start', 'inside', 'overlapping end']);
  });

  it('drops trips outside the range', () => {
    expect(kept).not.toContain('before');
    expect(kept).not.toContain('after');
  });

  it('ignores trips with no start date', () => {
    const undated = {...({} as TripInterface), locationName: 'undated', start: null, end: null};
    expect(tripsInRange([undated], new Date('2024-01-01'), new Date('2024-12-31'))).toEqual([]);
  });
});

describe('buildBackup', () => {
  const trips = [trip('Paris', '2026-03-01', '2026-03-10')];
  const addresses: AddressInterface[] = [{
    ...({} as AddressInterface), locationName: 'Toronto',
    start: new Date('2020-01-01'), end: null,
  }];
  const results: BioResult[] = [{
    id: 'r1', date: new Date('2026-01-15'), type: 'Ferritin', value: 40,
    metadata: {test: 'Ferritin'} as BioResult['metadata'],
  }];
  const backup = buildBackup(trips, addresses, results, new Date('2026-09-20T10:00:00Z'));

  it('records when it was taken and in what format', () => {
    expect(backup.version).toBe(1);
    expect(backup.exportedAt).toBe('2026-09-20T10:00:00.000Z');
  });

  it('holds every collection', () => {
    expect(backup.trips).toHaveLength(1);
    expect(backup.addresses).toHaveLength(1);
    expect(backup.bioResults).toHaveLength(1);
  });

  it('writes dates as ISO strings', () => {
    expect(backup.trips[0]).toMatchObject({start: '2026-03-01T00:00:00.000Z'});
    expect(backup.bioResults[0]).toMatchObject({date: '2026-01-15T00:00:00.000Z'});
  });

  it('leaves out reference ranges, which are not user data', () => {
    expect(backup.bioResults[0]).not.toHaveProperty('metadata');
  });

  it('survives a round trip through JSON', () => {
    expect(JSON.parse(JSON.stringify(backup))).toEqual(backup);
  });
});

describe('filenames', () => {
  it('names the backup by date', () => {
    expect(backupFilename(new Date('2026-09-20T10:00:00Z')))
      .toBe('data-journal-backup-2026-09-20.json');
  });

  it('names a range export by its range', () => {
    expect(rangeFilename(new Date('2021-01-01T00:00:00Z'), new Date('2026-01-01T00:00:00Z')))
      .toBe('trips-2021-01-01-to-2026-01-01.csv');
  });
});
