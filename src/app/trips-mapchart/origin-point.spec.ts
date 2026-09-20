import {describe, expect, it} from 'vitest';
import {getOriginPointOnDate} from './origin-point';
import {TripInterface} from '../trips/trips.service';
import {AddressInterface} from '../addresses/address.service';

// Where a trip started from: the trip you were already on if the dates
// overlap, otherwise the address you lived at on that date.
describe('getOriginPointOnDate', () => {
  const trip = (city: string, start: string, end: string): TripInterface => ({
    ...({} as TripInterface), city, lat: 1, lng: 2,
    start: new Date(start), end: new Date(end),
  });
  const address = (city: string, start: string, end: string | null): AddressInterface => ({
    ...({} as AddressInterface), city, lat: 3, lng: 4,
    start: new Date(start), end: end ? new Date(end) : null,
  });

  const homes = [address('Toronto', '2020-01-01', null)];

  it('uses the address of the day when no trip was under way', () => {
    const trips = [trip('Paris', '2026-03-01', '2026-03-10')];
    expect(getOriginPointOnDate(trips, homes, 0).id).toBe('Toronto');
  });

  it('uses the previous trip when this one starts before it ends', () => {
    const trips = [
      trip('Paris', '2026-03-01', '2026-03-10'),
      trip('Rome', '2026-03-05', '2026-03-12'),
    ];
    expect(getOriginPointOnDate(trips, homes, 1).id).toBe('Paris');
  });

  it('falls back to the address once the previous trip has ended', () => {
    const trips = [
      trip('Paris', '2026-03-01', '2026-03-10'),
      trip('Rome', '2026-04-01', '2026-04-05'),
    ];
    expect(getOriginPointOnDate(trips, homes, 1).id).toBe('Toronto');
  });

  it('picks the address whose period covers the date', () => {
    const moves = [
      address('Vancouver', '2024-01-01', '2025-12-31'),
      address('Toronto', '2026-01-01', null),
    ];
    const trips = [trip('Paris', '2024-06-01', '2024-06-10')];
    expect(getOriginPointOnDate(trips, moves, 0).id).toBe('Vancouver');
  });

  it('is null when nothing covers the date', () => {
    const trips = [trip('Paris', '2019-06-01', '2019-06-10')];
    expect(getOriginPointOnDate(trips, homes, 0)).toBeNull();
  });

  it('uses today when asked for the current location', () => {
    expect(getOriginPointOnDate([], homes, -1).id).toBe('Toronto');
  });
});
