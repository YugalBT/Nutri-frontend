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
import { TranslateService } from '../../i18n/translate.service';

import {
  AggregatedAnalyticsData,
  CompanyDashboardData,
  DashboardData,
} from '../../core/models/dashboarddata';

import { CommonService } from '../../shared/services/common.service';
import { ApiResponse } from '../../core/models/api-response';
import { TokenService } from '../../shared/services/token.service';
import { LoaderService } from '../../shared/services/loader.service';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';

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
    NgxSpinnerModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {

  user$: Observable<User | null>;
  user: User | null = null;
  isLoading = true;

  dashboardData: DashboardData = {
    totalCompanies: 0,
    totalUsers: 0,
    totalActiveUsers: 0,
    totalInActiveUsers: 0,
    totalFarms: 0,
    totalRations: 0,
    totalActiveFarms: 0,
    totalSuppliers: 0
  };

  companyDashboard: CompanyDashboardData | null = null;
  aggregatedAnalytics: AggregatedAnalyticsData | null = null;

  selectedYear = new Date().getFullYear();
  yearOptions = Array.from({ length: 7 }, (_, i) => new Date().getFullYear() - i);

  companyTrendChart: EChartsOption = {};
  adminTrendChart: EChartsOption = {};
  comparisonChart: EChartsOption = {};
  productionChart: EChartsOption = {};

  deaGauge!: EChartsOption;
  milkGauge!: EChartsOption;
  feedGauge!: EChartsOption;
  crepGauge!: EChartsOption;
  isSupplier = false;

  constructor(
    private store: Store,
    private commonService: CommonService,
    private translate: TranslateService, 
    private tokenservice: TokenService,
    private loader: LoaderService,
    private spinner: NgxSpinnerService,
  ) {
    this.user$ = this.store.select(selectAuthUser);
  }

  ngOnInit(): void {
    this.user$.subscribe((u) => {
      this.user = u;
      this.loadDashboard();
    });

    this.translate.lang$.subscribe(() => {
      this.loadDashboard();
    });
    
    const supplierData = this.tokenservice.getSupplierData();
    this.isSupplier = !!supplierData;
  }

  // get isAdmin(): boolean {
  //   const role = (this.user?.roleType || '').toUpperCase();
  //   return this.user?.isSuperAdmin === true || ['SUPERADMIN', 'ADMIN', 'COLLABORATOR'].includes(role);
  // }
  get isAdmin(): boolean {
  return this.user?.isSuperAdmin === true;
}
get isCompanyUser(): boolean {
  return this.user?.isCompany === true && !this.user?.isSuperAdmin;
}
  private get currentCompanyId(): string | null {
    return this.user?.tenantId || this.user?.parentTenantId || null;
  }

  onYearChange(year: number): void {
    this.selectedYear = Number(year);
    this.loadDashboard();
  }

  private t(key: string): string {
    return this.translate.instant(key);
  }

  loadDashboard(): void {

    this.spinner.show();
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
        this.spinner.hide();
      },
    });
  }

  private loadCompanyDashboard(): void {
    this.spinner.show();
    this.commonService.getCompanyDashboardData(this.selectedYear, this.currentCompanyId ?? undefined).subscribe({
      next: (res) => {

        this.companyDashboard = res?.isSuccess ? res.data : null;

        if (this.companyDashboard) {

          const d = this.companyDashboard;

          this.deaGauge = this.createGauge(this.t('dashboard.fatPercent'), d.fatPercent ?? 0, 3.0, 5.0);
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
              this.t('dashboard.cost'),
              this.t('dashboard.feedEfficiency'),
              this.t('dashboard.crep'),
              this.t('dashboard.avgMilk'),
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
            {
              name: this.t('dashboard.feedEfficiency'),
              type: 'line',
              smooth: true,
              data: this.companyDashboard?.kpiTrend?.map((x) => x.feedEfficiency ?? 0) || [],
            },
            {
              name: this.t('dashboard.crep'),
              type: 'line',
              smooth: true,
              data: this.companyDashboard?.kpiTrend?.map((x) => x.crep ?? 0) || [],
            },
            {
              name: this.t('dashboard.avgMilk'),
              type: 'line',
              smooth: true,
              data: this.companyDashboard?.kpiTrend?.map((x) => x.avgMilkPerDay ?? 0) || [],
            },
          ],
        };

        this.spinner.hide();
      },
      error: () => {
       this.spinner.hide();
      },
    });
  }

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
    this.spinner.show();
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
          color: ['#1d6b8f', '#f28c38'],
          tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(255, 255, 255, 0.98)',
            borderColor: 'rgba(15, 23, 42, 0.12)',
            borderWidth: 1,
            textStyle: { color: '#101828' },
            axisPointer: { type: 'shadow' },
          },
          grid: {
            left: 42,
            right: 18,
            top: 30,
            bottom: 84,
            containLabel: false,
          },
          legend: {
            top: 0,
            itemWidth: 14,
            itemHeight: 10,
            textStyle: { color: '#475467' },
            data: [
              this.t('dashboard.deaMilk'),
              this.t('dashboard.cost'),
            ]
          },
          xAxis: {
            type: 'category',
            data: comparison.map((c) => c.companyName),
            axisLabel: {
              interval: 0,
              rotate: 42,
              color: '#475467',
              fontSize: 10,
              margin: 16,
            },
            axisLine: { lineStyle: { color: '#d0d5dd' } },
            axisTick: { alignWithLabel: true },
          },
          yAxis: {
            type: 'value',
            min: 0,
            splitNumber: 5,
            axisLabel: {
              color: '#475467',
              fontSize: 11,
              margin: 8,
              formatter: (value: number) => `${Math.round(value)}`,
            },
            splitLine: { lineStyle: { color: '#d9e3ea' } },
            axisLine: { lineStyle: { color: '#d0d5dd' } },
          },
          series: [
            {
              name: this.t('dashboard.deaMilk'),
              type: 'bar',
              data: comparison.map((c) => c.deaMilk),
              barWidth: 18,
              itemStyle: {
                borderRadius: [4, 4, 0, 0],
                color: '#1d6b8f',
              },
            },
            {
              name: this.t('dashboard.cost'),
              type: 'bar',
              data: comparison.map((c) => c.cost),
              barWidth: 18,
              itemStyle: {
                borderRadius: [4, 4, 0, 0],
                color: '#f28c38',
              },
            },
          ],
        };

        this.productionChart = {
          color: ['#2aa39a'],
          tooltip: {
            trigger: 'axis',
            formatter: (params: any) => {
              const points = Array.isArray(params) ? params : [params];
              const header = points[0]?.axisValueLabel || points[0]?.name || '';
              const lines = points
                .map((p) => {
                  const rawValue = Number(p.value ?? 0);
                  const value = Number.isFinite(rawValue) ? rawValue : 0;
                  return `${p.marker}${p.seriesName}: <b>${value.toFixed(1).replace(/\.0$/, '')}</b>`;
                })
                .join('<br/>');
              return `${header}<br/>${lines}`;
            },
            backgroundColor: 'rgba(255, 255, 255, 0.98)',
            borderColor: 'rgba(15, 23, 42, 0.12)',
            borderWidth: 1,
            textStyle: { color: '#101828' },
            axisPointer: { type: 'shadow' },
          },
          grid: {
            left: 42,
            right: 18,
            top: 32,
            bottom: 84,
            containLabel: false,
          },
          xAxis: {
            type: 'category',
            data: comparison.map((c) => c.companyName),
            axisLabel: {
              interval: 0,
              rotate: 42,
              color: '#475467',
              fontSize: 10,
              margin: 16,
            },
            axisLine: { lineStyle: { color: '#d0d5dd' } },
            axisTick: { alignWithLabel: true },
          },
          yAxis: {
            type: 'value',
            min: 0,
            splitNumber: 5,
            axisLabel: {
              color: '#475467',
              fontSize: 11,
              margin: 8,
              formatter: (value: number) => `${Math.round(value)}`,
            },
            splitLine: { lineStyle: { color: '#d9e3ea' } },
            axisLine: { lineStyle: { color: '#d0d5dd' } },
          },
          series: [
            {
              name: this.t('dashboard.avgMilkPerDay'),
              type: 'bar',
              data: comparison.map((c) => c.avgMilkPerDay),
              barWidth: 18,
              barCategoryGap: '42%',
              itemStyle: {
                borderRadius: [4, 4, 0, 0],
                color: '#2aa39a',
              },
              label: {
                show: true,
                position: 'top',
                color: '#101828',
                fontSize: 11,
                fontWeight: 700,
                formatter: ({ value }) => {
                  const numericValue = Number(value ?? 0);
                  if (!numericValue) {
                    return '';
                  }

                  return numericValue.toFixed(1).replace(/\.0$/, '');
                },
              },
            },
          ],
        };

        this.spinner.hide();
      },
      error: () => {
        this.spinner.hide();
      },
    });
  }
}
