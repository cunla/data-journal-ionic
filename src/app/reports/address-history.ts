import {AddressInterface} from '../addresses/address.service';
import {MS_PER_DAY, startOfDay} from './presence';

export interface Gap {
  from: Date;
  to: Date;
  days: number;
  /** True when the gap runs up to today, i.e. no address covers now. */
  open: boolean;
}

export interface Overlap {
  from: Date;
  to: Date;
  days: number;
  first: string;
  second: string;
}

function label(address: AddressInterface): string {
  return address.locationName || address.city || address.address || 'Unnamed address';
}

function inclusiveDays(from: Date, to: Date): number {
  return Math.round((startOfDay(to).getTime() - startOfDay(from).getTime()) / MS_PER_DAY) + 1;
}

function dated(addresses: AddressInterface[]): AddressInterface[] {
  return addresses.filter(address => !!address.start)
    .slice()
    .sort((a, b) => a.start.getTime() - b.start.getTime());
}

function addDays(date: Date, days: number): Date {
  const next = startOfDay(date);
  next.setDate(next.getDate() + days);
  return next;
}

/**
 * Stretches of time no address record covers, which forms asking for an
 * unbroken address history will query. A gap running up to today is flagged
 * as open: it means no record says where you live now.
 */
export function findGaps(addresses: AddressInterface[], until: Date = new Date()): Gap[] {
  const sorted = dated(addresses);
  if (!sorted.length) {
    return [];
  }
  const today = startOfDay(until);
  const gaps: Gap[] = [];
  let covered = sorted[0].end ? startOfDay(sorted[0].end) : null;
  if (!covered) {
    return [];   // an open-ended first address covers everything after it
  }
  for (const address of sorted.slice(1)) {
    const start = startOfDay(address.start);
    if (start > addDays(covered, 1)) {
      const from = addDays(covered, 1);
      const to = addDays(start, -1);
      gaps.push({from, to, days: inclusiveDays(from, to), open: false});
    }
    if (!address.end) {
      return gaps;   // open-ended: covered from here on
    }
    const end = startOfDay(address.end);
    covered = end > covered ? end : covered;
  }
  if (covered < today) {
    const from = addDays(covered, 1);
    gaps.push({from, to: today, days: inclusiveDays(from, today), open: true});
  }
  return gaps;
}

/** Pairs of address records claiming the same days. */
export function findOverlaps(addresses: AddressInterface[], until: Date = new Date()): Overlap[] {
  const sorted = dated(addresses);
  const today = startOfDay(until);
  const overlaps: Overlap[] = [];
  for (let i = 0; i < sorted.length; i++) {
    for (let j = i + 1; j < sorted.length; j++) {
      const a = sorted[i];
      const b = sorted[j];
      const aEnd = a.end ? startOfDay(a.end) : today;
      const bStart = startOfDay(b.start);
      if (bStart > aEnd) {
        continue;
      }
      const bEnd = b.end ? startOfDay(b.end) : today;
      const from = bStart;
      const to = aEnd < bEnd ? aEnd : bEnd;
      overlaps.push({
        from, to, days: inclusiveDays(from, to),
        first: label(a), second: label(b),
      });
    }
  }
  return overlaps;
}
