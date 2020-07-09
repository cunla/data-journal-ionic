import {Component, OnInit} from '@angular/core';
import {BioService, BloodResult} from './bio.service';

@Component({
  selector: 'app-bloodresults',
  templateUrl: './bloodresults.page.html',
  styleUrls: ['./bloodresults.page.scss'],
})
export class BloodresultsPage implements OnInit {
  data: Map<any, Array<BloodResult>> = new Map<string, Array<BloodResult>>();
  groupby = 'date';

  constructor(private bioService: BioService) {
  }

  ngOnInit() {
    this.segmentChanged(null);
  }

  segmentChanged(groupby: CustomEvent) {
    this.groupby = groupby?.detail?.value || 'date';
    this.bioService.getResults().subscribe((allResults) => {
      this.data = new Map<string, Array<BloodResult>>();
      allResults.forEach((res) => {
        const group = (this.groupby === 'date') ? res.date.toDateString() : res.type;
        if (!this.data.has(group)) {
          this.data.set(group, []);
        }
        this.data.get(group).push(res);
      });
    });
  }
}
