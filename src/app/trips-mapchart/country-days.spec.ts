import {describe, expect, it} from 'vitest';
import {TripInterface} from '../trips/trips.service';
import {ALL_YEARS, countryVisits, fillOpacityForDays} from './country-days';

const trip = (country: string, start: string, end: string | null,
              extra: Partial<TripInterface> = {}): TripInterface => ({
  ...({} as TripInterface), country,
  start: new Date(start), end: end ? new Date(end) : null,
  ...extra,
});

describe('countryVisits', () => {
  const trips = [
    trip('France', '2026-03-01', '2026-03-10', {countryCode: 'FR', lat: 48.8, lng: 2.3}),
    trip('France', '2025-06-01', '2025-06-05', {countryCode: 'FR', lat: 43.3, lng: 5.4}),
    trip('Japan', '2026-07-01', '2026-07-04', {countryCode: 'JP', lat: 35.7, lng: 139.7}),
  ];

  it('adds up days per country across every year', () => {
    const visits = countryVisits(trips, ALL_YEARS);
    expect(visits.map(v => [v.country, v.days])).toEqual([['France', 15], ['Japan', 4]]);
  });

  it('counts only the chosen year', () => {
    expect(countryVisits(trips, 2025).map(v => [v.country, v.days])).toEqual([['France', 5]]);
  });

  it('keeps the country code for geocoding', () => {
    expect(countryVisits(trips, ALL_YEARS)[0].countryCode).toBe('FR');
  });

  it('puts the label at the centre of that country\'s trips', () => {
    const france = countryVisits(trips, ALL_YEARS)[0];
    expect(france.lat).toBeCloseTo((48.8 + 43.3) / 2, 5);
    expect(france.lng).toBeCloseTo((2.3 + 5.4) / 2, 5);
  });

  it('sorts by days, longest first', () => {
    expect(countryVisits(trips, ALL_YEARS).map(v => v.country)).toEqual(['France', 'Japan']);
  });

  it('skips trips with no country, which cannot be shaded', () => {
    expect(countryVisits([trip(null, '2026-01-01', '2026-01-05')], ALL_YEARS)).toEqual([]);
  });

  it('leaves the label position empty when no trip has coordinates', () => {
    const [visit] = countryVisits([trip('Peru', '2026-01-01', '2026-01-05')], ALL_YEARS);
    expect(visit.days).toBe(5);
    expect(visit.lat).toBeNull();
  });

  it('splits a new-year trip between its years', () => {
    const crossing = [trip('France', '2025-12-30', '2026-01-02', {countryCode: 'FR'})];
    expect(countryVisits(crossing, 2025)[0].days).toBe(2);
    expect(countryVisits(crossing, 2026)[0].days).toBe(2);
    expect(countryVisits(crossing, ALL_YEARS)[0].days).toBe(4);
  });
});

describe('fillOpacityForDays', () => {
  it('leaves unvisited countries unshaded', () => {
    expect(fillOpacityForDays(0)).toBe(0);
  });

  it('darkens as the days add up', () => {
    const steps = [1, 20, 100, 500].map(fillOpacityForDays);
    expect(steps).toEqual([...steps].sort((a, b) => a - b));
    expect(new Set(steps).size).toBe(4);
  });

  it('caps at the darkest step', () => {
    expect(fillOpacityForDays(5000)).toBe(fillOpacityForDays(366));
  });
});
