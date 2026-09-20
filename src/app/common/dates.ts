export const MS_PER_DAY = 24 * 3600 * 1000;

/** Midnight local time, so a day counts as a day whatever the clock says. */
export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Calendar days from a to b, counting both ends. */
export function inclusiveDays(from: Date, to: Date): number {
  return Math.round((startOfDay(to).getTime() - startOfDay(from).getTime()) / MS_PER_DAY) + 1;
}

import {AbstractControl, FormGroup, ValidatorFn} from '@angular/forms';

export class Dates {
  static dateLessThanValidator(from: string, to: string): ValidatorFn {
    return (control: AbstractControl) => {
      const group = control as FormGroup;
      const f = group.controls[from];
      const t = group.controls[to];
      if (f.value !== null && t.value !== null && f.value > t.value) {
        return {
          dates: 'Date from should be less than Date to'
        };
      }
      return {};
    };
  }

  static daysDiffFunc(date1: Date, date2: Date): number {
    date2 = date2 || new Date();
    const diff = Math.abs(date1.getTime() - date2.getTime());
    return Math.ceil(diff / (1000 * 3600 * 24));
  }

}
