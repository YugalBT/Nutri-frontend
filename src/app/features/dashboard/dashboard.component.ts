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
import { TranslateService } from '../../i18n/translate.service'; // ✅ added

import {
  AggregatedAnalyticsData,
  CompanyDashboardData,
  DashboardData,
} from '../../core/models/dashboarddata';

import { CommonService } from '../../shared/services/common.service';
import { ApiResponse } from '../../core/models/api-response';
import { TokenService } from '../../shared/services/token.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgxEchartsModule,
    TranslatePipe,
    DatePipe,
    DecimalPipe,
  ],
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

  deaGauge!: EChartsOption;
  milkGauge!: EChartsOption;
  feedGauge!: EChartsOption;
  crepGauge!: EChartsOption;
  isSupplier = false;

  constructor(
    private store: Store,
    private commonService: CommonService,
    private translate: TranslateService, // ✅ added,
    private tokenservice: TokenService
  ) {
    this.user$ = this.store.select(selectAuthUser);
  }

  ngOnInit(): void {
    this.user$.subscribe((u) => {
      this.user = u;
      this.loadDashboard();
    });

    // ✅ language change support (optional but recommended)
    this.translate.lang$.subscribe(() => {
      this.loadDashboard();
    });
    
    // ✅ check if user is supplier
    const supplierData = this.tokenservice.getSupplierData();
    this.isSupplier = !!supplierData;
  }

  get isAdmin(): boolean {
    const role = (this.user?.roleType || '').toUpperCase();
    return role === 'ADMIN' && this.user?.isSuperAdmin === true;
  }

  private get currentCompanyId(): string | null {
    return this.user?.tenantId || this.user?.parentTenantId || null;
  }

  onYearChange(year: number): void {
    this.selectedYear = Number(year);
    this.loadDashboard();
  }

  // ✅ helper for translation
  private t(key: string): string {
    return this.translate.instant(key);
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
    this.commonService.getCompanyDashboardData(this.selectedYear, this.currentCompanyId ?? undefined).subscribe({
      next: (res) => {

        this.companyDashboard = res?.isSuccess ? res.data : null;

        if (this.companyDashboard) {

          const d = this.companyDashboard;

          // ✅ ONLY label translated (logic untouched)
          this.deaGauge = this.createGauge(this.t('dashboard.dea'), d.deaMilk ?? 0, 0.9, 1.5);
          this.milkGauge = this.createGauge(this.t('dashboard.avgMilk'), d.avgMilkPerDay ?? 0, 30, 55);
          this.feedGauge = this.createGauge(this.t('dashboard.feedEfficiency'), d.feedEfficiency ?? 0, 1, 2.4);
          this.crepGauge = this.createGauge(this.t('dashboard.crep'), d.crep ?? 0, 2, 5);
        }

        this.companyTrendChart = {
          tooltip: { trigger: 'axis' },
          legend: {
            data: [
              this.t('dashboard.iofc'),
              this.t('dashboard.deaMilk'),
              this.t('dashboard.cost')
            ]
          },
          xAxis: {
            type: 'category',
            data: this.companyDashboard?.kpiTrend?.map((x) => x.label) || [],
          },
          yAxis: { type: 'value' },
          series: [
            {
              name: this.t('dashboard.iofc'),
              type: 'line',
              smooth: true,
              data: this.companyDashboard?.kpiTrend?.map((x) => x.iofc) || [],
            },
            {
              name: this.t('dashboard.deaMilk'),
              type: 'line',
              smooth: true,
              data: this.companyDashboard?.kpiTrend?.map((x) => x.deaMilk) || [],
            },
            {
              name: this.t('dashboard.cost'),
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

  // ✅ ORIGINAL FUNCTION (UNCHANGED)
  createGauge(title: string, value: number, min: number, max: number): EChartsOption {
    return {
      title: {
        text: title,
        left: 'center',
        top: 0,
        textStyle: {
          fontSize: 14,
          fontWeight: 'bold'
        }
      },
      series: [
        {
          type: 'gauge',
          radius: '90%',
          center: ['50%', '60%'],
          min,
          max,
          axisLine: {
            lineStyle: {
              width: 20,
              color: [
                [0.3, '#ff4d4f'],
                [0.6, '#fadb14'],
                [1, '#52c41a']
              ]
            }
          },
          pointer: {
            width: 4,
            length: '70%'
          },
          progress: {
            show: true,
            width: 20
          },
          detail: {
            fontSize: 20,
            formatter: '{value}',
            offsetCenter: [0, '70%']
          },
          data: [{ value }]
        }
      ]
    };
  }

  // ✅ KEEP THIS (important)
  getCowPosition(value: number | null | undefined): number {
    const min = 0.9;
    const max = 1.5;

    if (value === null || value === undefined) return 0;

    const clamped = Math.max(min, Math.min(max, value));
    return ((clamped - min) / (max - min)) * 100;
  }

  private loadAdminAnalytics(): void {
    this.commonService.getAggregatedAnalytics(this.selectedYear).subscribe({
      next: (res) => {

        this.aggregatedAnalytics = res?.isSuccess ? res.data : null;

        const trend = this.aggregatedAnalytics?.monthlyTrend || [];

        this.adminTrendChart = {
          tooltip: { trigger: 'axis' },
          legend: {
            data: [
              this.t('dashboard.iofc'),
              this.t('dashboard.deaMilk'),
              this.t('dashboard.cost')
            ]
          },
          xAxis: { type: 'category', data: trend.map((t) => t.label) },
          yAxis: { type: 'value' },
          series: [
            { name: this.t('dashboard.iofc'), type: 'line', smooth: true, data: trend.map((t) => t.iofc) },
            { name: this.t('dashboard.deaMilk'), type: 'line', smooth: true, data: trend.map((t) => t.deaMilk) },
            { name: this.t('dashboard.cost'), type: 'line', smooth: true, data: trend.map((t) => t.cost) },
          ],
        };

        const comparison = this.aggregatedAnalytics?.companyComparison || [];

        this.comparisonChart = {
          tooltip: { trigger: 'axis' },
          legend: {
            data: [
              this.t('dashboard.iofc'),
              this.t('dashboard.deaMilk'),
              this.t('dashboard.cost')
            ]
          },
          xAxis: {
            type: 'category',
            data: comparison.map((c) => c.companyName),
            axisLabel: { interval: 0, rotate: 20 },
          },
          yAxis: { type: 'value' },
          series: [
            { name: this.t('dashboard.iofc'), type: 'bar', data: comparison.map((c) => c.iofc) },
            { name: this.t('dashboard.deaMilk'), type: 'bar', data: comparison.map((c) => c.deaMilk) },
            { name: this.t('dashboard.cost'), type: 'bar', data: comparison.map((c) => c.cost) },
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
