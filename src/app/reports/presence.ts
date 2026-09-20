import {TripInterface} from '../trips/trips.service';
import {AddressInterface} from '../addresses/address.service';

export const MS_PER_DAY = 24 * 3600 * 1000;

export interface CountryDays {
  country: string;
  days: number;
}

export interface YearSummary {
  year: number;
  daysAway: number;
  byCountry: CountryDays[];
}

export interface WindowSummary {
  from: Date;
  to: Date;
  daysAway: number;
  daysHome: number;
  byCountry: CountryDays[];
}

/** Midnight local time, so a day counts as a day whatever the clock says. */
export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Calendar days a trip covers inside [from, to]. Both ends of both ranges count,
 * so a trip that leaves and returns on the same day is one day, and a trip with
 * no return date is treated as still running today.
 */
export function overlapDays(start: Date, end: Date, from: Date, to: Date): number {
  if (!start) {
    return 0;
  }
  const first = startOfDay(start) > startOfDay(from) ? startOfDay(start) : startOfDay(from);
  const lastRaw = end ? startOfDay(end) : startOfDay(new Date());
  const last = lastRaw < startOfDay(to) ? lastRaw : startOfDay(to);
  if (last < first) {
    return 0;
  }
  return Math.round((last.getTime() - first.getTime()) / MS_PER_DAY) + 1;
}

/** The country lived in on a date, from the address history. */
export function homeCountryOn(addresses: AddressInterface[], date: Date): string | null {
  const day = startOfDay(date);
  for (const address of addresses) {
    if (!address.start) {
      continue;
    }
    const from = startOfDay(address.start);
    const to = address.end ? startOfDay(address.end) : null;
    if (from <= day && (!to || to >= day)) {
      return address.country ?? null;
    }
  }
  return null;
}

/** The country lived in most recently, used as the default home country. */
export function currentHomeCountry(addresses: AddressInterface[]): string | null {
  return homeCountryOn(addresses, new Date())
    ?? addresses.map(a => a.country).find(country => !!country)
    ?? null;
}

function tally(counts: Map<string, number>): CountryDays[] {
  return [...counts.entries()]
    .map(([country, days]) => ({country, days}))
    .sort((a, b) => b.days - a.days || a.country.localeCompare(b.country));
}

/** Days spent in each country other than home, within [from, to]. */
export function daysAwayBetween(trips: TripInterface[],
                                homeCountry: string | null,
                                from: Date,
                                to: Date): WindowSummary {
  const counts = new Map<string, number>();
  for (const trip of trips) {
    if (homeCountry && trip.country === homeCountry) {
      continue;
    }
    const days = overlapDays(trip.start, trip.end, from, to);
    if (days <= 0) {
      continue;
    }
    const country = trip.country || 'Unknown';
    counts.set(country, (counts.get(country) ?? 0) + days);
  }
  const byCountry = tally(counts);
  const daysAway = byCountry.reduce((sum, entry) => sum + entry.days, 0);
  const windowDays = overlapDays(from, to, from, to);
  return {from, to, daysAway, daysHome: Math.max(windowDays - daysAway, 0), byCountry};
}

/** One row per calendar year that any trip touches, newest first. */
export function summariseByYear(trips: TripInterface[], homeCountry: string | null): YearSummary[] {
  const years = new Set<number>();
  const today = new Date();
  for (const trip of trips) {
    if (!trip.start) {
      continue;
    }
    const last = trip.end ?? today;
    for (let year = trip.start.getFullYear(); year <= last.getFullYear(); year++) {
      years.add(year);
    }
  }
  return [...years]
    .sort((a, b) => b - a)
    .map(year => {
      const summary = daysAwayBetween(trips, homeCountry,
        new Date(year, 0, 1), new Date(year, 11, 31));
      return {year, daysAway: summary.daysAway, byCountry: summary.byCountry};
    });
}

/** A window of whole years ending today, the shape residency rules tend to use. */
export function rollingWindow(trips: TripInterface[],
                              homeCountry: string | null,
                              years: number): WindowSummary {
  const to = startOfDay(new Date());
  const from = startOfDay(new Date(to.getFullYear() - years, to.getMonth(), to.getDate() + 1));
  return daysAwayBetween(trips, homeCountry, from, to);
}
