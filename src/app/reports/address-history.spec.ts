import {describe, expect, it} from 'vitest';
import {AddressInterface} from '../addresses/address.service';
import {findGaps, findOverlaps} from './address-history';

const address = (name: string, start: string, end: string | null): AddressInterface => ({
  ...({} as AddressInterface), locationName: name,
  start: new Date(start), end: end ? new Date(end) : null,
});

const TODAY = new Date('2026-09-20');

describe('findGaps', () => {
  it('finds nothing when one address runs into the next', () => {
    const history = [
      address('Toronto', '2020-01-01', '2023-12-31'),
      address('Ottawa', '2024-01-01', null),
    ];
    expect(findGaps(history, TODAY)).toEqual([]);
  });

  it('reports the days between two addresses', () => {
    const history = [
      address('Toronto', '2020-01-01', '2023-12-31'),
      address('Ottawa', '2024-02-01', null),
    ];
    const [gap] = findGaps(history, TODAY);
    expect(gap.from).toEqual(new Date(2024, 0, 1));
    expect(gap.to).toEqual(new Date(2024, 0, 31));
    expect(gap.days).toBe(31);
    expect(gap.open).toBe(false);
  });

  it('flags having no current address', () => {
    const history = [address('Toronto', '2020-01-01', '2026-08-31')];
    const [gap] = findGaps(history, TODAY);
    expect(gap.open).toBe(true);
    expect(gap.days).toBe(20);
  });

  it('is quiet while an open-ended address covers today', () => {
    expect(findGaps([address('Toronto', '2020-01-01', null)], TODAY)).toEqual([]);
  });

  it('ignores records with no start date', () => {
    const history = [address('Nowhere', null as unknown as string, null)];
    history[0].start = null;
    expect(findGaps(history, TODAY)).toEqual([]);
  });

  it('does not invent a gap when periods are nested', () => {
    const history = [
      address('Toronto', '2020-01-01', '2025-12-31'),
      address('Sublet', '2021-01-01', '2021-06-30'),
      address('Ottawa', '2026-01-01', null),
    ];
    expect(findGaps(history, TODAY)).toEqual([]);
  });
});

describe('findOverlaps', () => {
  it('finds nothing for a clean history', () => {
    const history = [
      address('Toronto', '2020-01-01', '2023-12-31'),
      address('Ottawa', '2024-01-01', null),
    ];
    expect(findOverlaps(history, TODAY)).toEqual([]);
  });

  it('reports two records claiming the same days', () => {
    const history = [
      address('Toronto', '2020-01-01', '2024-01-10'),
      address('Ottawa', '2024-01-01', null),
    ];
    const [overlap] = findOverlaps(history, TODAY);
    expect(overlap.first).toBe('Toronto');
    expect(overlap.second).toBe('Ottawa');
    expect(overlap.days).toBe(10);
  });

  it('catches two open-ended addresses at once', () => {
    const history = [
      address('Toronto', '2020-01-01', null),
      address('Ottawa', '2026-09-01', null),
    ];
    const [overlap] = findOverlaps(history, TODAY);
    expect(overlap.days).toBe(20);
  });
});
