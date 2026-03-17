import { Component, ViewChild, Input, OnChanges, SimpleChanges } from '@angular/core';
import { TablerIconsModule } from 'angular-tabler-icons';
import { MaterialModule } from 'src/app/material.module';
import { MatButtonModule } from '@angular/material/button';

import {
  ApexChart,
  ChartComponent,
  ApexDataLabels,
  ApexLegend,
  ApexStroke,
  ApexTooltip,
  ApexAxisChartSeries,
  ApexXAxis,
  ApexYAxis,
  ApexGrid,
  ApexPlotOptions,
  ApexFill,
  ApexMarkers,
  ApexResponsive,
  NgApexchartsModule,
} from 'ng-apexcharts';


interface month {
  value: string;
  viewValue: string;
}

export interface profitExpanceChart {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  yaxis: ApexYAxis;
  xaxis: ApexXAxis;
  fill: ApexFill;
  tooltip: ApexTooltip;
  stroke: ApexStroke;
  legend: ApexLegend;
  grid: ApexGrid;
  marker: ApexMarkers;
}

@Component({
  selector: 'app-profit-expenses',
  imports: [MaterialModule, TablerIconsModule, MatButtonModule, NgApexchartsModule],
  templateUrl: './profit-expenses.component.html',
})
export class AppProfitExpensesComponent implements OnChanges {

  @ViewChild('chart') chart: ChartComponent = Object.create(null);

  public profitExpanceChart!: Partial<profitExpanceChart> | any;

  @Input() mode: 'day' | 'month' | 'year' = 'month';

  months: month[] = [
    { value: 'mar', viewValue: 'Sep 2025' },
    { value: 'apr', viewValue: 'Oct 2025' },
    { value: 'june', viewValue: 'Nov 2025' },
  ];


  constructor() {
    this.profitExpanceChart = {
      grid: {
        borderColor: 'rgba(0,0,0,0.1)',
        strokeDashArray: 3,
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '30%',
          borderRadius: 4,
          endingShape: 'rounded',
        },
      },
      chart: {
        type: 'bar',
        height: 390,
        offsetY: 10,
        foreColor: '#adb0bb',
        fontFamily: 'inherit',
        toolbar: { show: false },
      },
      dataLabels: { enabled: false },
      markers: { size: 0 },
      legend: { show: false },
      stroke: {
        show: true,
        width: 5,
        colors: ['transparent'],
      },
      tooltip: { theme: 'light' },
      responsive: [
        {
          breakpoint: 600,
          options: {
            plotOptions: {
              bar: {
                borderRadius: 3,
              },
            },
          },
        },
      ],
    };

    this.updateChartForMode(this.mode);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['mode']) {
      this.updateChartForMode(this.mode);
    }
  }

  private updateChartForMode(mode: 'day' | 'month' | 'year') {
    if (mode === 'day') {
      this.profitExpanceChart.series = [
        {
          name: 'Logins',
          data: [5, 9, 7, 10, 8, 6, 4],
          color: '#0085db',
        },
        {
          name: 'Follow-ups submitted',
          data: [3, 5, 6, 7, 5, 4, 3],
          color: '#fb977d',
        },
      ];
      this.profitExpanceChart.xaxis = {
        type: 'category',
        categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        axisTicks: { show: false },
        axisBorder: { show: false },
        labels: {
          style: { cssClass: 'grey--text lighten-2--text fill-color' },
        },
      };
    } else if (mode === 'month') {
      this.profitExpanceChart.series = [
        {
          name: 'Active patients',
          data: [30, 40, 32, 50, 42, 55, 45],
          color: '#0085db',
        },
        {
          name: 'New registrations',
          data: [10, 18, 15, 20, 17, 22, 19],
          color: '#fb977d',
        },
      ];
      this.profitExpanceChart.xaxis = {
        type: 'category',
        categories: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7'],
        axisTicks: { show: false },
        axisBorder: { show: false },
        labels: {
          style: { cssClass: 'grey--text lighten-2--text fill-color' },
        },
      };
    } else {
      // year
      this.profitExpanceChart.series = [
        {
          name: 'Active patients',
          data: [20, 25, 30, 35, 40, 45, 50, 52, 54, 56, 58, 60],
          color: '#0085db',
        },
        {
          name: 'New registrations',
          data: [5, 8, 10, 12, 15, 18, 20, 19, 17, 16, 14, 12],
          color: '#fb977d',
        },
      ];
      this.profitExpanceChart.xaxis = {
        type: 'category',
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        axisTicks: { show: false },
        axisBorder: { show: false },
        labels: {
          style: { cssClass: 'grey--text lighten-2--text fill-color' },
        },
      };
    }
  }
}
