import {Component, Input, OnInit} from '@angular/core';
import * as Highcharts from 'highcharts';
import {BioResult, BioResultMeta} from '../bio.service';
import {BioMetadataService} from '../bio-metadata.service';


@Component({
  selector: 'app-resultchart',
  templateUrl: './resultchart.component.html',
  styleUrls: ['./resultchart.component.scss'],
})
export class ResultChartComponent implements OnInit {
  @Input() chartData: Array<BioResult>;
  @Input() title: string = '';
  private metadata: BioResultMeta;
  Highcharts: typeof Highcharts = Highcharts;
  chartOptions: Highcharts.Options = {
    chart: {
      height: '30%',
      type: 'spline',
      spacingLeft: 20,
    },
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
    yAxis: {
      gridLineColor: 'transparent',
    },
    tooltip: {
      headerFormat: '{point.x:%Y-%m-%d}<br/>',
      // pointFormat:'{point.y}',
    },
  };

  constructor(private bioMetadataService: BioMetadataService) {
  }

  logChartInstance(chart) {
    if (this.metadata) {
      chart.yAxis[0].addPlotBand({
        color: '#daf0cc',
        from: this.metadata.low,
        to: this.metadata.high,
        label: {
          text: 'Normal range',
        }
      });
    }
  }

  ngOnInit() {
    const data = this.chartData
      .map((point) => [point.date.getTime(), point.value])
      .sort((a, b) => {
        return a[0] - b[0];
      });
    const min = 0.9 * data.reduce((a, b) => {
      return a[1] < b[1] ? a : b;
    })[1];
    const max = 1.1 * data.reduce((a, b) => {
      return a[1] > b[1] ? a : b;
    })[1];
    this.chartOptions.series.push({
      data,
      name: this.title,
      type: 'spline',
    });
    // Set min & max for Y axis
    this.metadata = this.bioMetadataService.getTestMetaData(this.title);
    this.chartOptions.yAxis.min = Math.floor(Math.min(this.metadata?.low * 0.9, min));
    this.chartOptions.yAxis.max = Math.ceil(Math.max(this.metadata?.high * 1.1, max));
  }

}
