import {FormGroup, ValidatorFn} from '@angular/forms';

export class Dates {
  static dateLessThanValidator(from: string, to: string): ValidatorFn {
    return (group: FormGroup) => {
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

// See the Moment.js docs for the meaning of these formats:
// https://momentjs.com/docs/#/displaying/format/
export const DATE_FORMATS = {
  parse: {
    dateInput: 'YYYY-MM-DD',
  },
  display: {
    dateInput: 'YYYY-MM-DD',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};
