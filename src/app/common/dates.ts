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
