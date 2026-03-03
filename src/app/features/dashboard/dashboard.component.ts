import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../../state/auth/auth.models';
import { Store } from '@ngrx/store';
import { selectAuthUser } from '../../state/auth/auth.selectors';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxEchartsModule } from 'ngx-echarts';
import type { EChartsOption } from 'echarts';
import { TranslatePipe } from '../../i18n/translate.pipe';
import {
  AggregatedAnalyticsData,
  CompanyDashboardData,
  DashboardData,
} from '../../core/models/dashboarddata';
import { CommonService } from '../../shared/services/common.service';
import { ApiResponse } from '../../core/models/api-response';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxEchartsModule, TranslatePipe, DatePipe, DecimalPipe],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  user$: Observable<User | null>;
  user: User | null = null;
  isLoading = false;

  dashboardData: DashboardData = {
    totalCompanies: 0,
    totalUsers: 0,
    totalActiveUsers: 0,
    totalInActiveUsers: 0,
    totalFarms: 0,
    totalRations: 0,
    totalActiveFarms: 0,
  };

  companyDashboard: CompanyDashboardData | null = null;
  aggregatedAnalytics: AggregatedAnalyticsData | null = null;

  selectedYear = new Date().getFullYear();
  yearOptions = Array.from({ length: 7 }, (_, i) => new Date().getFullYear() - i);

  companyTrendChart: EChartsOption = {};
  adminTrendChart: EChartsOption = {};
  comparisonChart: EChartsOption = {};

  constructor(
    private store: Store,
    private commonService: CommonService,
  ) {
    this.user$ = this.store.select(selectAuthUser);
  }

  ngOnInit(): void {
    this.user$.subscribe((u) => {
      this.user = u;
      this.loadDashboard();
    });
  }

  get isAdmin(): boolean {
    return (this.user?.roleType || '').toUpperCase() === 'ADMIN';
  }

  onYearChange(year: number): void {
    this.selectedYear = Number(year);
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.isLoading = true;

    this.commonService.getDashboardData().subscribe({
      next: (res: ApiResponse<DashboardData>) => {
        if (res?.isSuccess && res?.data) {
          this.dashboardData = res.data;
        }

        if (this.isAdmin) {
          this.loadAdminAnalytics();
        } else {
          this.loadCompanyDashboard();
        }
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  private loadCompanyDashboard(): void {
    this.commonService.getCompanyDashboardData(this.selectedYear).subscribe({
      next: (res) => {
        this.companyDashboard = res?.isSuccess ? res.data : null;
        this.companyTrendChart = {
          tooltip: { trigger: 'axis' },
          legend: { data: ['IOFC', 'D&A Milk', 'Cost'] },
          xAxis: {
            type: 'category',
            data: this.companyDashboard?.kpiTrend?.map((x) => x.label) || [],
          },
          yAxis: { type: 'value' },
          series: [
            {
              name: 'IOFC',
              type: 'line',
              smooth: true,
              data: this.companyDashboard?.kpiTrend?.map((x) => x.iofc) || [],
            },
            {
              name: 'D&A Milk',
              type: 'line',
              smooth: true,
              data: this.companyDashboard?.kpiTrend?.map((x) => x.deaMilk) || [],
            },
            {
              name: 'Cost',
              type: 'line',
              smooth: true,
              data: this.companyDashboard?.kpiTrend?.map((x) => x.cost) || [],
            },
          ],
        };
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  private loadAdminAnalytics(): void {
    this.commonService.getAggregatedAnalytics(this.selectedYear).subscribe({
      next: (res) => {
        this.aggregatedAnalytics = res?.isSuccess ? res.data : null;

        const trend = this.aggregatedAnalytics?.monthlyTrend || [];
        this.adminTrendChart = {
          tooltip: { trigger: 'axis' },
          legend: { data: ['IOFC', 'D&A Milk', 'Cost'] },
          xAxis: { type: 'category', data: trend.map((t) => t.label) },
          yAxis: { type: 'value' },
          series: [
            { name: 'IOFC', type: 'line', smooth: true, data: trend.map((t) => t.iofc) },
            { name: 'D&A Milk', type: 'line', smooth: true, data: trend.map((t) => t.deaMilk) },
            { name: 'Cost', type: 'line', smooth: true, data: trend.map((t) => t.cost) },
          ],
        };

        const comparison = this.aggregatedAnalytics?.companyComparison || [];
        this.comparisonChart = {
          tooltip: { trigger: 'axis' },
          legend: { data: ['IOFC', 'D&A Milk', 'Cost'] },
          xAxis: {
            type: 'category',
            data: comparison.map((c) => c.companyName),
            axisLabel: { interval: 0, rotate: 20 },
          },
          yAxis: { type: 'value' },
          series: [
            { name: 'IOFC', type: 'bar', data: comparison.map((c) => c.iofc) },
            { name: 'D&A Milk', type: 'bar', data: comparison.map((c) => c.deaMilk) },
            { name: 'Cost', type: 'bar', data: comparison.map((c) => c.cost) },
          ],
        };

        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }
}
