import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {HttpClient} from '@angular/common/http';

export interface BioResult {
  id: any;
  date: Date;
  type: string;
  value: number;
}

export const EMPTY_RESULT: BioResult = {
  id: null,
  date: new Date(),
  type: '',
  value: 0,
}

export interface BioResultMeta {
  test: string;
  low: number;
  high: number;
  unit: string;
  abreviation: string;
  ageVariance: boolean;
  category: string;
  wikipedia: string;
  shortDescription: string;
  AwesomeList: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class BioService {
  private mockData: Array<BioResult> = [
    {
      id: 1,
      date: new Date(2019, 7, 3),
      type: 'Testosterone',
      value: 15
    },
    {
      id: 1,
      date: new Date(2020, 7, 3),
      type: 'Testosterone',
      value: 8
    },
    {
      id: 2,
      date: new Date(2019, 7, 3),
      type: 'Hematocrit',
      value: 46.3
    },
    {
      id: 3,
      date: new Date(2020, 6, 30),
      type: 'Hematocrit',
      value: 56
    },
    {
      id: 4,
      date: new Date(2018, 11, 29),
      type: 'Hematocrit',
      value: 47
    },
  ];

  constructor(private http: HttpClient,
  ) {
  }

  getResults(): Observable<Array<BioResult>> {
    return of(this.mockData);
  }

  refresh() {
  }

  create(value: BioResult) {
    if (!value.id) {
      value.id = 40;
    }
    this.mockData.push(value);
    return new Promise<null>((resolve) => {
      resolve();
    });
  }

  update(id: any, value: BioResult) {
    this.mockData.forEach((bioResult) => {
      if (bioResult.id === id) {
        bioResult.type = value.type;
        bioResult.date = value.date;
        bioResult.value = value.value;
      }
    });
    return new Promise<null>((resolve) => {
      resolve();
    });
  }

  delete(id: any) {
    return new Promise(resolve => {
      resolve();
    })
  }

}
