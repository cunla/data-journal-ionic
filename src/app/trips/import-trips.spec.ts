import {describe, expect, it} from 'vitest';
import {CsvTools} from '../common/csvtools.service';
import {parseTripsCsv} from './import-trips';

describe('parseTripsCsv', () => {
  it('reads a file this app exported', () => {
    const csv = CsvTools.convertToCsv([
      {start: new Date(2026, 2, 1), end: new Date(2026, 2, 10),
        locationName: 'Paris, France', purpose: 'holiday'},
    ], ['start', 'end', 'locationName', 'purpose']);
    const {trips, skipped} = parseTripsCsv(csv);
    expect(skipped).toEqual([]);
    expect(trips).toHaveLength(1);
    expect(trips[0].locationName).toBe('Paris, France');
    expect(trips[0].start.getFullYear()).toBe(2026);
    expect(trips[0].purpose).toBe('holiday');
  });

  it('does not care about column order or spelling', () => {
    const {trips} = parseTripsCsv('Destination,Country Code,From\nRome,IT,2026-04-01\n');
    expect(trips[0]).toMatchObject({locationName: 'Rome', countryCode: 'IT'});
    expect(trips[0].start.getMonth()).toBe(3);
  });

  it('accepts day-first and slash-separated dates', () => {
    const {trips} = parseTripsCsv('start,location\n03/04/2026,Rome\n');
    expect(trips[0].start.getDate()).toBe(3);
    expect(trips[0].start.getMonth()).toBe(3);
  });

  it('reads coordinates as numbers and leaves blanks empty', () => {
    const {trips} = parseTripsCsv('start,location,lat,lng\n2026-04-01,Rome,41.9,\n');
    expect(trips[0].lat).toBe(41.9);
    expect(trips[0].lng).toBeNull();
  });

  it('falls back to the city when there is no location column', () => {
    const {trips} = parseTripsCsv('start,city\n2026-04-01,Rome\n');
    expect(trips[0].locationName).toBe('Rome');
    expect(trips[0].city).toBe('Rome');
  });

  it('skips rows with no usable date, naming the line', () => {
    const {trips, skipped} = parseTripsCsv('start,location\nnot a date,Rome\n2026-04-01,Oslo\n');
    expect(trips).toHaveLength(1);
    expect(skipped).toEqual(['Line 2: no usable start date.']);
  });

  it('skips rows that end before they start', () => {
    const {skipped} = parseTripsCsv('start,end,location\n2026-04-10,2026-04-01,Rome\n');
    expect(skipped).toEqual(['Line 2: ends before it starts.']);
  });

  it('skips rows with nowhere to go', () => {
    const {skipped} = parseTripsCsv('start,location\n2026-04-01,\n');
    expect(skipped).toEqual(['Line 2: no location.']);
  });

  it('explains an empty file', () => {
    expect(parseTripsCsv('').skipped).toEqual(['The file is empty.']);
  });

  it('explains a file with no start column', () => {
    const {trips, skipped} = parseTripsCsv('place,notes\nRome,holiday\n');
    expect(trips).toEqual([]);
    expect(skipped[0]).toContain('No start date column');
  });
});
