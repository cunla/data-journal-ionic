import {TripInterface} from '../trips/trips.service';
import {overlapDays} from '../reports/presence';

/** -1 in the year filter means every year. */
export const ALL_YEARS = -1;

export interface CountryVisit {
  country: string;
  /** ISO 3166-1 alpha-2, used to geocode the country to a Place ID. */
  countryCode: string | null;
  days: number;
  /** Centre of the trips recorded there, where the day count is drawn. */
  lat: number | null;
  lng: number | null;
}

/**
 * Days spent in each country, for the whole history or one year. Unlike the
 * reports page this counts every country, home included: the map is showing
 * where you have been, not time away.
 */
export function countryVisits(trips: TripInterface[], year: number = ALL_YEARS): CountryVisit[] {
  const from = year === ALL_YEARS ? new Date(1900, 0, 1) : new Date(year, 0, 1);
  const to = year === ALL_YEARS ? new Date(2999, 11, 31) : new Date(year, 11, 31);
  const visits = new Map<string, CountryVisit>();
  const points = new Map<string, { lat: number; lng: number }[]>();

  for (const trip of trips) {
    if (!trip.country) {
      continue;   // nothing to shade without a country
    }
    const days = overlapDays(trip.start, trip.end, from, to);
    if (days <= 0) {
      continue;
    }
    const visit = visits.get(trip.country) ?? {
      country: trip.country, countryCode: null, days: 0, lat: null, lng: null,
    };
    visit.days += days;
    visit.countryCode = visit.countryCode ?? trip.countryCode ?? null;
    visits.set(trip.country, visit);

    if (Number.isFinite(+trip.lat) && Number.isFinite(+trip.lng) && trip.lat !== null) {
      const seen = points.get(trip.country) ?? [];
      seen.push({lat: +trip.lat, lng: +trip.lng});
      points.set(trip.country, seen);
    }
  }

  for (const [country, seen] of points) {
    const visit = visits.get(country);
    visit.lat = seen.reduce((sum, p) => sum + p.lat, 0) / seen.length;
    visit.lng = seen.reduce((sum, p) => sum + p.lng, 0) / seen.length;
  }

  return [...visits.values()].sort((a, b) => b.days - a.days || a.country.localeCompare(b.country));
}

/**
 * How strongly to fill a country: the more days, the darker. Four steps rather
 * than a continuous scale, so neighbouring countries stay tellable apart.
 */
export function fillOpacityForDays(days: number): number {
  if (days <= 0) {
    return 0;
  }
  if (days < 15) {
    return 0.2;
  }
  if (days < 61) {
    return 0.4;
  }
  if (days < 366) {
    return 0.6;
  }
  return 0.75;
}
