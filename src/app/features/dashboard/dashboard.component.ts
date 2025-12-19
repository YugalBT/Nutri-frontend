import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../../state/auth/auth.models';
import { Store } from '@ngrx/store';
import { selectAuthUser } from '../../state/auth/auth.selectors';
import { CommonModule } from '@angular/common';
import { NgxEchartsModule } from 'ngx-echarts';
import type { EChartsOption } from 'echarts';
import { TranslatePipe } from '../../i18n/translate.pipe';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule,NgxEchartsModule,TranslatePipe],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {

  user$: Observable<User | null>;

  constructor(private store: Store) {
    this.user$ = this.store.select(selectAuthUser);
  }


  feedCostChart: EChartsOption = {
    tooltip: { trigger: 'item', formatter: '{b}: {d}%' },
    legend: { orient: 'vertical', right: '5%', top: 'center' },
    series: [
      {
        type: 'pie',
        radius: ['60%', '80%'],
        label: { show: false },
        data: [
          { value: 35, name: 'Maize Silage' },
          { value: 15, name: 'Cottonseed Cake' },
          { value: 30, name: 'Mineral Mix' },
          { value: 7, name: 'Wheat Bran' },
          { value: 20, name: 'Rice Bran' }
        ]
      }
    ]
  };

  recentEventsChart: EChartsOption = {
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'] },
    yAxis: { type: 'value' },
    series: [
      {
        type: 'line',
        smooth: true,
        areaStyle: { opacity: 0.15 },
        data: [4000, 500, 1000, 300, 1800, 1000, 2800]
      }
    ]
  };
}
