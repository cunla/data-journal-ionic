import {Component, Input, OnInit} from '@angular/core';
import * as Highcharts from 'highcharts';
import {BioResult} from '../bio.service';
import {BioMetadataService, BioResultMeta} from '../bio-metadata.service';


@Component({
    selector: 'app-resultchart',
    templateUrl: './resultchart.component.html',
    styleUrls: ['./resultchart.component.scss'],
    standalone: false
})
export class ResultChartComponent implements OnInit {
  @Input() chartData: Array<BioResult>;
  @Input() title: string = '';
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
      min: null, max: null,
    },
    tooltip: {
      headerFormat: '{point.x:%Y-%m-%d}<br/>',
      // pointFormat:'{point.y}',
    },
  };
  private metadata: BioResultMeta;

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
    // @ts-expect-error: Highcharts type definitions are incomplete
    const yaxisOptions: Highcharts.YAxisOptions = this.chartOptions.yAxis;
    yaxisOptions.min = Math.floor(Math.min(this.metadata?.low * 0.9, min));
    yaxisOptions.max = Math.ceil(Math.max(this.metadata?.high * 1.1, max));
  }

}
