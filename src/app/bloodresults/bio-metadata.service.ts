import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {map} from 'rxjs/operators';
import {AutoCompleteService} from "../autocomplete/auto-complete.service";


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
export class BioMetadataService implements AutoCompleteService {
  formValueAttribute = 'test';
  private bloodtestDataMap: Map<string, BioResultMeta>;
  private bloodtestData: Array<BioResultMeta> = [];
  private iconMap = new Map<string, string>();

  constructor(private http: HttpClient,
  ) {
    this.iconMap.set('Blood Chemistry', 'eyedrop-outline');
    this.iconMap.set('Blood Count', 'add-outline');
    this.iconMap.set('Bone Health', 'eyedrop-outline');
    this.iconMap.set('Coagulation', 'eyedrop-outline');
    this.iconMap.set('Hormones', 'barbell-outline');
    this.iconMap.set('Immunity', 'medkit-outline');
    this.iconMap.set('Iron Markers & Complete Blood Count', 'medkit-outline');

    this.http.get('/assets/bloodtest-data.json')
      .subscribe((res: Array<BioResultMeta>) => {
        this.bloodtestData = res;
        this.bloodtestDataMap = new Map(res.map((x) => [x.test.toLowerCase(), x]));
      });
  }

  getResults(keyword: string): Observable<BioResultMeta[]> {
    let observable: Observable<BioResultMeta[]>;

    if (this.bloodtestData.length === 0) {
      // @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 0.
      observable = this.http.get('/assets/bloodtest-data.json');
    } else {
      observable = of(this.bloodtestData);
    }

    return observable.pipe(
      map(
        (result: BioResultMeta[]) => {
          return result.filter(
            (item) => {
              return item.test.toLowerCase().indexOf(keyword.toLowerCase()) >= 0;
            }
          );
        }
      )
    );
  }

  getIcon(icon: string) {
    return this.iconMap.get(icon) || 'eyedrop-outline';
  }

  getTestMetaData(testName: string): BioResultMeta {
    testName = testName.toLowerCase();
    const res = this.bloodtestDataMap.get(testName);
    if (res) {
      return res;
    }
    for (const [key, value] of this.bloodtestDataMap) {
      if (key.indexOf(testName) >= 0) {
        return value;
      }
    }
  }

  getMetaData() {
    return of(this.bloodtestDataMap);
  }
}
