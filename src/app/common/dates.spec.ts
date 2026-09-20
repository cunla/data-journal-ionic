import {describe, expect, it} from 'vitest';
import {FormControl, FormGroup} from '@angular/forms';
import {Dates} from './dates';

describe('Dates.daysDiffFunc', () => {
  it('counts the days between two dates', () => {
    expect(Dates.daysDiffFunc(new Date('2026-01-01'), new Date('2026-01-08'))).toBe(7);
  });

  it('is the same either way round', () => {
    const a = new Date('2026-01-01');
    const b = new Date('2026-03-01');
    expect(Dates.daysDiffFunc(a, b)).toBe(Dates.daysDiffFunc(b, a));
  });

  it('measures against today when there is no end date', () => {
    const tenDaysAgo = new Date(Date.now() - 10 * 24 * 3600 * 1000);
    expect(Dates.daysDiffFunc(tenDaysAgo, null)).toBe(10);
  });
});

describe('Dates.dateLessThanValidator', () => {
  const validate = (start: string, end: string) => {
    const group = new FormGroup({start: new FormControl(start), end: new FormControl(end)});
    return Dates.dateLessThanValidator('start', 'end')(group);
  };

  it('accepts a start before the end', () => {
    expect(validate('2026-01-01', '2026-01-05')).toEqual({});
  });

  it('rejects a start after the end', () => {
    expect(validate('2026-02-01', '2026-01-05')).toHaveProperty('dates');
  });

  it('accepts an open-ended range', () => {
    expect(validate('2026-02-01', null)).toEqual({});
  });
});
