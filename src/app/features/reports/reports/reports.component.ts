import { Component } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { NgxEchartsModule } from 'ngx-echarts';
import { ReusableTableComponent } from '../../../shared/components/reusable-table/reusable-table.component';
import type { EChartsOption } from 'echarts';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    SharedModule,
    NgxEchartsModule,
    ReusableTableComponent
  ],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent {

  // ================= TABLE =================
  columns: string[] = [
    'Ration',
    'Animal Group',
    'Animals',
    'Milk (L)',
    'Cost (₹)',
    'Income (₹)',
    'Margin (₹)'
  ];

  columnFields: string[] = [
    'ration',
    'animalGroup',
    'animals',
    'milk',
    'cost',
    'income',
    'margin'
  ];

  reports : any = [
    {
      ration: 'High Milk A',
      animalGroup: 'Lactating A',
      animals: 85,
      milk: 3272,
      cost: 18742,
      income: 147240,
      margin: 128498
    },
    // {
    //   ration: 'Standard B',
    //   animalGroup: 'Lactating B',
    //   animals: 72,
    //   milk: 2362,
    //   cost: 15876,
    //   income: 106290,
    //   margin: 90414
    // },
    // {
    //   ration: 'Dry Cow',
    //   animalGroup: 'Dry Cows',
    //   animals: 45,
    //   milk: 0,
    //   cost: 4500,
    //   income: 0,
    //   margin: -4500
    // }
  ];

  // ================= CHARTS =================

  costIncomeChart: EChartsOption = {
  tooltip: { trigger: 'axis' },
  legend: { data: ['Cost', 'Income'] },
  xAxis: {
    type: 'category',
    data: ['Lactating A', 'Lactating B', 'Dry Cows']
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      name: 'Cost',
      type: 'bar',
      data: [18742, 15876, 4500]
    },
    {
      name: 'Income',
      type: 'bar',
      data: [147240, 106290, 0]
    }
  ]
};

marginTrendChart: EChartsOption = {
  tooltip: { trigger: 'axis' },
  xAxis: {
    type: 'category',
    data: ['Dec 4', 'Dec 5', 'Dec 6', 'Dec 7', 'Dec 8', 'Dec 9', 'Dec 10']
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      name: 'Margin',
      type: 'line',
      smooth: true,
      data: [120000, 122000, 119500, 123000, 121000, 124000, 125000]
    }
  ]
};


}
