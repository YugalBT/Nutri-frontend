import { Component } from '@angular/core';
import { NgxEchartsModule } from 'ngx-echarts';
import { SharedModule } from '../../../shared/shared.module';
import type { EChartsOption } from 'echarts';

@Component({
  selector: 'app-economic-report-list',
  standalone: true,
  imports: [SharedModule, NgxEchartsModule],
  templateUrl: './economic-report-list.component.html',
  styleUrl: './economic-report-list.component.css'
})
export class EconomicReportListComponent {

  // KPI Values
  costPerAnimal = 279;
  incomePerAnimal = 3375;
  marginPerAnimal = 3096;

  feedEfficiency = 1209.7;
  marginPercentage = 91.7;
  costPerLiter = 11.16;

  // Cost vs Income Chart
  costIncomeChart: EChartsOption = {
    tooltip: { trigger: 'axis' },
    legend: {
      data: ['Cost per Animal (₹)', 'Income per Animal (₹)']
    },
    xAxis: {
      type: 'category',
      data: ['Daily']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: 'Cost per Animal (₹)',
        type: 'bar',
        data: [279],
        itemStyle: {
          color: '#f46a4e'
        }
      },
      {
        name: 'Income per Animal (₹)',
        type: 'bar',
        data: [3375],
        itemStyle: {
          color: '#34c38f'
        }
      }
    ]
  };

  // Margin Trend Chart
  marginTrendChart: EChartsOption = {
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: ['Day 1', 'Day 2', 'Day 3', 'Day 4']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: 'Margin',
        type: 'line',
        data: [2800, 3000, 2950, 3096],
        smooth: true,
        itemStyle: {
          color: '#556ee6'
        }
      }
    ]
  };
}
