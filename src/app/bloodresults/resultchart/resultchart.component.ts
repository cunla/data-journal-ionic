import {Component, Input, OnInit} from '@angular/core';
import * as Highcharts from 'highcharts';
import {BioResult} from '../bio.service';


@Component({
  selector: 'app-resultchart',
  templateUrl: './resultchart.component.html',
  styleUrls: ['./resultchart.component.scss'],
})
export class ResultChartComponent implements OnInit {
  @Input() chartData: Array<BioResult>;
  @Input() title: string = '';
  Highcharts: typeof Highcharts = Highcharts;
  chartOptions: Highcharts.Options = {
    credits: {enabled: false},
    legend: {enabled: false,},
    title: {text: this.title},
    series: [],
    xAxis: {
      type: 'datetime',
      labels: {format: '{value:%Y-%m-%d}',},
      title: {
        text: 'Date'
      }
    },
    tooltip:{
      headerFormat:'{point.x:%Y-%m-%d}<br/>',
      // pointFormat:'{point.y}',
    },
  };

  constructor() {
  }

  ngOnInit() {
    const data = this.chartData
      .map((point) => [point.date.getTime(), point.value])
      .sort((a, b) => {
        return a[0] - b[0];
      });
    console.log(data);
    this.chartOptions.series.push({
      data: data,
      name: this.title,
      type: 'spline',
    });
  }

}
