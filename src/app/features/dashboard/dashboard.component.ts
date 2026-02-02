import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../../state/auth/auth.models';
import { Store } from '@ngrx/store';
import { selectAuthUser } from '../../state/auth/auth.selectors';
import { CommonModule } from '@angular/common';
import { NgxEchartsModule } from 'ngx-echarts';
import type { EChartsOption } from 'echarts';
import { TranslatePipe } from '../../i18n/translate.pipe';
import { DashboardData } from '../../core/models/dashboarddata';
import { CommonService } from '../../shared/services/common.service';
import { ApiResponse } from '../../core/models/api-response';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule,NgxEchartsModule,TranslatePipe],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  user$: Observable<User | null>;
  dashboardData: DashboardData = {
    totalCompanies: 0,
    totalUsers: 0,
    totalActiveUsers: 0,
    totalInActiveUsers: 0,
    totalFarms:0,
    totalRations:0,
    totalActiveFarms:0

  };

  isLoading = false;
  constructor(
    private store: Store,
    private commonService : CommonService
  ) 
  {
    this.user$ = this.store.select(selectAuthUser);
  }

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.isLoading = true;

    this.commonService.getDashboardData().subscribe({
      next: (res: ApiResponse<DashboardData>) => {
        if (res.isSuccess && res?.data) {
          this.dashboardData = res?.data;
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Dashboard API error', err);
        this.isLoading = false;
      }
    });
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
