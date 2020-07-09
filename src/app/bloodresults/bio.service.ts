import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';

export interface BloodResult {
  date: Date;
  type: string;
  value: number;
}

@Injectable({
  providedIn: 'root'
})
export class BioService {
  private mockData: Array<BloodResult> = [
    {
      date: new Date(2019, 7, 3),
      type: 'Testosterone',
      value: 5
    },
    {
      date: new Date(2019, 7, 3),
      type: 'Hematocrit',
      value: 0.463
    },
    {
      date: new Date(2020, 6, 30),
      type: 'Hematocrit',
      value: 0.43
    },
    {
      date: new Date(2018, 11, 29),
      type: 'Hematocrit',
      value: 0.43
    },
  ];

  constructor() {
  }

  getResults(): Observable<Array<BloodResult>> {
    return of(this.mockData);
  }
}
