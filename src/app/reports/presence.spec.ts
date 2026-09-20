import {describe, expect, it} from 'vitest';
import {TripInterface} from '../trips/trips.service';
import {AddressInterface} from '../addresses/address.service';
import {
  currentHomeCountry,
  daysAwayBetween,
  effectiveHomeCountry,
  homeCountryOn,
  overlapDays,
  rollingWindow,
  summariseByYear,
} from './presence';

const trip = (country: string, start: string, end: string | null): TripInterface => ({
  ...({} as TripInterface), country, start: new Date(start), end: end ? new Date(end) : null,
});

const address = (country: string, start: string, end: string | null): AddressInterface => ({
  ...({} as AddressInterface), country, start: new Date(start), end: end ? new Date(end) : null,
});

describe('overlapDays', () => {
  it('counts both the day out and the day back', () => {
    expect(overlapDays(new Date('2026-03-01'), new Date('2026-03-05'),
      new Date('2026-01-01'), new Date('2026-12-31'))).toBe(5);
  });

  it('counts a same-day trip as one day', () => {
    expect(overlapDays(new Date('2026-03-01'), new Date('2026-03-01'),
      new Date('2026-01-01'), new Date('2026-12-31'))).toBe(1);
  });

  it('clips a trip to the window', () => {
    expect(overlapDays(new Date('2025-12-28'), new Date('2026-01-03'),
      new Date('2026-01-01'), new Date('2026-12-31'))).toBe(3);
  });

  it('is zero when the trip is outside the window', () => {
    expect(overlapDays(new Date('2024-05-01'), new Date('2024-05-10'),
      new Date('2026-01-01'), new Date('2026-12-31'))).toBe(0);
  });

  it('treats a trip with no return date as still running', () => {
    const yesterday = new Date(Date.now() - 24 * 3600 * 1000);
    expect(overlapDays(yesterday, null, yesterday, new Date())).toBe(2);
  });
});

describe('homeCountryOn', () => {
  const history = [
    address('Canada', '2026-01-01', null),
    address('Israel', '2020-01-01', '2025-12-31'),
  ];

  it('finds the address covering the date', () => {
    expect(homeCountryOn(history, new Date('2022-06-01'))).toBe('Israel');
    expect(homeCountryOn(history, new Date('2026-06-01'))).toBe('Canada');
  });

  it('is null before any address', () => {
    expect(homeCountryOn(history, new Date('2019-01-01'))).toBeNull();
  });

  it('takes the open-ended address as the current home', () => {
    expect(currentHomeCountry(history)).toBe('Canada');
  });
});

describe('effectiveHomeCountry', () => {
  const history = [
    address('Canada', '2026-01-01', null),
    address('Israel', '2020-01-01', '2025-12-31'),
  ];

  it('uses the address covering the date', () => {
    expect(effectiveHomeCountry(history, new Date('2022-06-01'))).toBe('Israel');
  });

  it('falls back to the earliest address for dates before the history', () => {
    expect(effectiveHomeCountry(history, new Date('2015-01-01'))).toBe('Israel');
  });

  it('falls back to the last address started before an uncovered date', () => {
    const gapped = [
      address('Israel', '2020-01-01', '2024-12-31'),
      address('Canada', '2026-01-01', null),
    ];
    expect(effectiveHomeCountry(gapped, new Date('2025-06-01'))).toBe('Israel');
  });

  it('is null with no address history', () => {
    expect(effectiveHomeCountry([], new Date('2026-01-01'))).toBeNull();
  });
});

describe('daysAwayBetween', () => {
  const home = [address('Canada', '2020-01-01', null)];
  const trips = [
    trip('France', '2026-03-01', '2026-03-10'),   // 10 days
    trip('France', '2026-06-01', '2026-06-05'),   // 5 days
    trip('Japan', '2026-07-01', '2026-07-04'),    // 4 days
    trip('Canada', '2026-08-01', '2026-08-20'),   // home, not counted
  ];
  const summary = daysAwayBetween(trips, home, new Date('2026-01-01'), new Date('2026-12-31'));

  it('ignores trips inside the home country', () => {
    expect(summary.byCountry.map(c => c.country)).toEqual(['France', 'Japan']);
  });

  it('adds up repeat visits to the same country', () => {
    expect(summary.byCountry[0]).toEqual({country: 'France', days: 15});
  });

  it('totals the days away', () => {
    expect(summary.daysAway).toBe(19);
  });

  it('reports the rest of the window as days home', () => {
    expect(summary.daysHome).toBe(365 - 19);
  });

  it('names the home country of the window', () => {
    expect(summary.homeCountries).toEqual(['Canada']);
  });

  it('counts every country when there is no address history', () => {
    const all = daysAwayBetween(trips, [], new Date('2026-01-01'), new Date('2026-12-31'));
    expect(all.daysAway).toBe(19 + 20);
    expect(all.homeCountries).toEqual([]);
  });

  it('files a trip with no country under Unknown', () => {
    const summaryUnknown = daysAwayBetween([trip(null, '2026-02-01', '2026-02-02')], home,
      new Date('2026-01-01'), new Date('2026-12-31'));
    expect(summaryUnknown.byCountry).toEqual([{country: 'Unknown', days: 2}]);
  });

  it('follows a move abroad: the old country becomes time away', () => {
    const moved = [
      address('Israel', '2020-01-01', '2025-12-31'),
      address('Canada', '2026-01-01', null),
    ];
    const visits = [
      trip('Canada', '2024-05-01', '2024-05-10'),   // away while living in Israel
      trip('Canada', '2026-05-01', '2026-05-10'),   // home once moved
      trip('Israel', '2026-07-01', '2026-07-05'),   // away, now that home moved
    ];
    const before = daysAwayBetween(visits, moved, new Date('2024-01-01'), new Date('2024-12-31'));
    const after = daysAwayBetween(visits, moved, new Date('2026-01-01'), new Date('2026-12-31'));
    expect(before.byCountry).toEqual([{country: 'Canada', days: 10}]);
    expect(after.byCountry).toEqual([{country: 'Israel', days: 5}]);
  });

  it('lists both home countries when the window spans a move', () => {
    const moved = [
      address('Israel', '2020-01-01', '2025-12-31'),
      address('Canada', '2026-01-01', null),
    ];
    const span = daysAwayBetween([], moved, new Date('2024-01-01'), new Date('2026-12-31'));
    expect(span.homeCountries).toEqual(['Israel', 'Canada']);
  });
});

describe('summariseByYear', () => {
  const trips = [
    trip('France', '2025-12-28', '2026-01-03'),
    trip('Japan', '2026-07-01', '2026-07-04'),
  ];
  const rows = summariseByYear(trips, [address('Canada', '2020-01-01', null)]);

  it('gives a row per year touched, newest first', () => {
    expect(rows.map(r => r.year)).toEqual([2026, 2025]);
  });

  it('splits a new-year trip across both years', () => {
    expect(rows.find(r => r.year === 2025).daysAway).toBe(4);
    expect(rows.find(r => r.year === 2026).daysAway).toBe(3 + 4);
  });
});

describe('rollingWindow', () => {
  it('covers whole years back from today', () => {
    const today = new Date();
    const recent = new Date(today.getTime() - 30 * 24 * 3600 * 1000);
    const summary = rollingWindow(
      [{...({} as TripInterface), country: 'France', start: recent, end: recent}],
      [address('Canada', '2020-01-01', null)], 5);
    expect(summary.daysAway).toBe(1);
    expect(summary.from.getFullYear()).toBe(today.getFullYear() - 5);
  });

  it('leaves out trips older than the window', () => {
    const old = new Date();
    old.setFullYear(old.getFullYear() - 7);
    const summary = rollingWindow(
      [{...({} as TripInterface), country: 'France', start: old, end: old}],
      [address('Canada', '2020-01-01', null)], 5);
    expect(summary.daysAway).toBe(0);
  });
});
