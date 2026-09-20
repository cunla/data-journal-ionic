import {TripInterface} from '../trips/trips.service';
import {AddressInterface} from '../addresses/address.service';

export const MS_PER_DAY = 24 * 3600 * 1000;

export interface CountryDays {
  country: string;
  /** ISO 3166-1 alpha-2, for the flag; null when no trip recorded one. */
  countryCode: string | null;
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
  /** The home countries that applied during the window, oldest first. */
  homeCountries: string[];
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
  return effectiveHomeCountry(addresses, new Date());
}

/**
 * The home country to judge a date by. Prefers the address covering that date;
 * failing that, the last address started before it, so trips recorded before
 * the address history begins are still measured against somewhere sensible.
 */
export function effectiveHomeCountry(addresses: AddressInterface[], date: Date): string | null {
  const exact = homeCountryOn(addresses, date);
  if (exact) {
    return exact;
  }
  const known = addresses
    .filter(address => address.start && address.country)
    .sort((a, b) => a.start.getTime() - b.start.getTime());
  if (!known.length) {
    return null;
  }
  const day = startOfDay(date);
  const previous = known.filter(address => startOfDay(address.start) <= day).pop();
  return (previous ?? known[0]).country;
}

/** Every home country that applied during [from, to], oldest first. */
export function homeCountriesBetween(addresses: AddressInterface[],
                                     from: Date,
                                     to: Date): string[] {
  const countries = addresses
    .filter(address => address.country && overlapDays(address.start, address.end, from, to) > 0)
    .sort((a, b) => a.start.getTime() - b.start.getTime())
    .map(address => address.country);
  const fallback = effectiveHomeCountry(addresses, to);
  if (!countries.length && fallback) {
    countries.push(fallback);
  }
  return [...new Set(countries)];
}

function tally(counts: Map<string, number>, codes: Map<string, string>): CountryDays[] {
  return [...counts.entries()]
    .map(([country, days]) => ({country, countryCode: codes.get(country) ?? null, days}))
    .sort((a, b) => b.days - a.days || a.country.localeCompare(b.country));
}

/**
 * Days spent in each country other than home, within [from, to]. Home is taken
 * from the address history as it stood on each trip's start date, so a move
 * abroad changes what counts as away from that point on.
 */
export function daysAwayBetween(trips: TripInterface[],
                                addresses: AddressInterface[],
                                from: Date,
                                to: Date): WindowSummary {
  const counts = new Map<string, number>();
  const codes = new Map<string, string>();
  for (const trip of trips) {
    const days = overlapDays(trip.start, trip.end, from, to);
    if (days <= 0) {
      continue;
    }
    const home = effectiveHomeCountry(addresses, trip.start);
    if (home && trip.country === home) {
      continue;
    }
    const country = trip.country || 'Unknown';
    counts.set(country, (counts.get(country) ?? 0) + days);
    if (trip.countryCode && !codes.has(country)) {
      codes.set(country, trip.countryCode);
    }
  }
  const byCountry = tally(counts, codes);
  const daysAway = byCountry.reduce((sum, entry) => sum + entry.days, 0);
  const windowDays = overlapDays(from, to, from, to);
  return {
    from, to, daysAway, byCountry,
    daysHome: Math.max(windowDays - daysAway, 0),
    homeCountries: homeCountriesBetween(addresses, from, to),
  };
}

/** One row per calendar year that any trip touches, newest first. */
export function summariseByYear(trips: TripInterface[],
                                addresses: AddressInterface[]): YearSummary[] {
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
      const summary = daysAwayBetween(trips, addresses,
        new Date(year, 0, 1), new Date(year, 11, 31));
      return {year, daysAway: summary.daysAway, byCountry: summary.byCountry};
    });
}

/** A window of whole years ending today, the shape residency rules tend to use. */
export function rollingWindow(trips: TripInterface[],
                              addresses: AddressInterface[],
                              years: number): WindowSummary {
  const to = startOfDay(new Date());
  const from = startOfDay(new Date(to.getFullYear() - years, to.getMonth(), to.getDate() + 1));
  return daysAwayBetween(trips, addresses, from, to);
}
