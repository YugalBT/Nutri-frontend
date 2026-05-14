import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxEchartsModule } from 'ngx-echarts';
import { Store } from '@ngrx/store';

import { SharedModule } from '../../shared/shared.module';
import { CommonService } from '../../shared/services/common.service';
import { ToastService } from '../../shared/services/toast.service';
import { User } from '../../state/auth/auth.models';
import { selectAuthUser } from '../../state/auth/auth.selectors';

import type { EChartsOption } from 'echarts';

interface BenchmarkAnalytics {
  year: number;
  period: string;
  companyId?: string;
  companyName?: string;
  kpiSummary: any[];
  benchmarkComparison: any[];
  companyRanking: any[];
  trendData: any[];
  costBreakdown: any[];
  economicSummary: any[];
  topPerformerPercent: number;
  averagePerformerPercent: number;
  belowAveragePercent: number;
  recentReports: any[];
  lastUpdated: string;
  totalCompaniesInBenchmark: number;
}

interface SelectOption {
  id: string;
  name: string;
}

type BenchmarkView = 'overview' | 'market' | 'scatter' | 'radar' | 'robot' | 'reports';

@Component({
  selector: 'app-benchmark-analytics',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    NgxEchartsModule,
    DecimalPipe,
  ],
  templateUrl: './benchmark-analytics.component.html',
  styleUrls: ['./benchmark-analytics.component.css'],
})
export class BenchmarkAnalyticsComponent implements OnInit {
  user: User | null = null;

  activeView: BenchmarkView = 'overview';
  benchmarkViews: Array<{ id: BenchmarkView; label: string }> = [
    { id: 'overview', label: 'Overview' },
    { id: 'market', label: 'Market Price' },
    { id: 'scatter', label: 'Scatter' },
    { id: 'radar', label: 'Radar' },
    { id: 'robot', label: 'Robot' },
    { id: 'reports', label: 'Reports' },
  ];

  selectedYear = new Date().getFullYear();
  selectedPeriod = 'Full Year';
  selectedCompanyId = '';
  selectedRegion = 'All Regions';
  selectedAnimalGroup = 'All Groups';
  selectedCompareAgainst = 'Market Average';
  marketMilkPrice = 0.53;

  yearOptions = Array.from(
    { length: 7 },
    (_, i) => new Date().getFullYear() - i
  );

  periodOptions = ['Full Year', 'Monthly', 'Quarterly', 'Annual'];
  companyOptions: SelectOption[] = [{ id: '', name: 'All Companies' }];
  regionOptions = ['All Regions'];
  animalGroupOptions: SelectOption[] = [{ id: 'All Groups', name: 'All Groups' }];
  compareAgainstOptions = [
    'Market Average',
    'Top 25%',
    'Bottom 25%',
  ];

  isLoading = false;
  isCompanyLoading = false;
  isAnimalGroupLoading = false;

  benchmarkData: BenchmarkAnalytics | null = null;

  trendChart: EChartsOption = {};
  rankingChart: EChartsOption = {};
  costBreakdownChart: EChartsOption = {};
  distributionChart: EChartsOption = {};
  overviewDeaChart: EChartsOption = {};
  overviewIofcChart: EChartsOption = {};
  marketDeaChart: EChartsOption = {};
  marketIofcChart: EChartsOption = {};
  milkScatterChart: EChartsOption = {};
  feedScatterChart: EChartsOption = {};
  radarComparisonChart: EChartsOption = {};
  robotScatterChart: EChartsOption = {};
  milkingChart: EChartsOption = {};

  constructor(
    private store: Store,
    private commonService: CommonService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.store.select(selectAuthUser).subscribe((user) => {
      this.user = user;

      if (this.user) {
        this.loadCompanies();
        this.loadAnimalGroups();
        this.loadAnalytics();
      }
    });
  }

  onFiltersChange(): void {
    this.loadAnalytics();
  }

  onCompanyChange(): void {
    this.selectedAnimalGroup = 'All Groups';
    this.loadAnimalGroups();
    this.loadAnalytics();
  }

  applyFilters(): void {
    this.loadAnalytics();
  }

  setView(view: BenchmarkView): void {
    this.activeView = view;
  }

  private loadAnalytics(): void {
    if (!this.user) {
      return;
    }

    this.isLoading = true;

    this.commonService
      .getBenchmarkAnalytics(
        this.selectedYear,
        this.selectedCompanyId || null,
        this.selectedPeriod,
        this.selectedAnimalGroup !== 'All Groups' ? this.selectedAnimalGroup : null
      )
      .subscribe({
        next: (res: any) => {
          this.benchmarkData = res?.data || null;

          this.buildCharts();

          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading benchmark analytics:', err);

          this.benchmarkData = null;
          this.isLoading = false;

          this.toast.error('Unable to load benchmark analytics.');
        },
      });
  }

  private loadCompanies(): void {
    this.isCompanyLoading = true;

    this.commonService.getCompanyDropdown().subscribe({
      next: (res) => {
        const companies = (res.data ?? []).map((company: any) => ({
          id: company.id,
          name: company.name,
        }));

        this.companyOptions = [
          { id: '', name: 'All Companies' },
          ...companies,
        ];

        this.isCompanyLoading = false;
      },
      error: () => {
        this.companyOptions = [{ id: '', name: 'All Companies' }];
        this.isCompanyLoading = false;
      },
    });
  }

  private loadAnimalGroups(): void {
    this.isAnimalGroupLoading = true;

    this.commonService.getAnimalGroupsListPost(this.selectedCompanyId || undefined).subscribe({
      next: (res: any) => {
        const raw = Array.isArray(res.data) ? res.data : (res.data?.items ?? []);
        const groups = raw
          .map((group: any) => ({
            id: group.animalGroupNameEn || group.animalGroupId,
            name: group.animalGroupNameEn || 'Unnamed Group',
          }))
          .filter((group: SelectOption) => !!group.id);

        this.animalGroupOptions = [
          { id: 'All Groups', name: 'All Groups' },
          ...groups,
        ];

        if (!this.animalGroupOptions.some((group) => group.id === this.selectedAnimalGroup)) {
          this.selectedAnimalGroup = 'All Groups';
        }

        this.isAnimalGroupLoading = false;
      },
      error: () => {
        this.animalGroupOptions = [{ id: 'All Groups', name: 'All Groups' }];
        this.selectedAnimalGroup = 'All Groups';
        this.isAnimalGroupLoading = false;
      },
    });
  }

  private buildCharts(): void {
    if (!this.benchmarkData) {
      return;
    }

    const trendData = this.benchmarkData.trendData || [];

    // Trend Chart
    this.trendChart = {
      tooltip: {
        trigger: 'axis',
      },

      legend: {
        data: ['IOFC', 'Milk Production', 'Feed Cost'],
        textStyle: {
          color: 'var(--text)',
        },
      },

      xAxis: {
        type: 'category',
        data: trendData.map((x) => x.month),

        axisLabel: {
          color: 'var(--text3)',
        },
      },

      yAxis: {
        type: 'value',

        axisLabel: {
          color: 'var(--text3)',
        },
      },

      series: [
        {
          name: 'IOFC',
          type: 'line',
          smooth: true,
          data: trendData.map((x) => x.iofc),

          lineStyle: {
            color: '#4dc0b5',
            width: 2,
          },

          areaStyle: {
            color: 'rgba(77,192,181,0.1)',
          },
        },

        {
          name: 'Milk Production',
          type: 'line',
          smooth: true,
          data: trendData.map((x) => x.milkProduction),

          lineStyle: {
            color: '#43b4e3',
            width: 2,
          },

          areaStyle: {
            color: 'rgba(67,180,227,0.1)',
          },
        },

        {
          name: 'Feed Cost',
          type: 'line',
          smooth: true,
          data: trendData.map((x) => x.feedCost),

          lineStyle: {
            color: '#f2a91d',
            width: 2,
          },

          areaStyle: {
            color: 'rgba(242,169,29,0.1)',
          },
        },
      ],
    };

    // Ranking Chart
    const ranking = this.benchmarkData.companyRanking || [];

    this.rankingChart = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
      },

      xAxis: {
        type: 'value',

        axisLabel: {
          color: 'var(--text3)',
        },
      },

      yAxis: {
        type: 'category',

        data: ranking.map((x) => x.companyName),

        axisLabel: {
          color: 'var(--text3)',
          interval: 0,
        },
      },

      series: [
        {
          type: 'bar',

          data: ranking.map((x) => x.iofcValue),

          itemStyle: {
            color: '#4dc0b5',
          },
        },
      ],
    };

    // Cost Breakdown Chart
    const costData = this.benchmarkData.costBreakdown || [];
    const visibleCostData = costData.filter((x) => Number(x.amount || 0) > 0);

    this.costBreakdownChart = {
      tooltip: {
        trigger: 'item',
      },

      legend: {
        data: visibleCostData.map((x) => x.category),

        textStyle: {
          color: 'var(--text)',
        },
      },

      series: [
        {
          type: 'pie',

          radius: ['40%', '70%'],

          data: visibleCostData.map((x) => ({
            name: x.category,
            value: x.amount,
          })),
        },
      ],
    };

    // Distribution Chart
    this.distributionChart = {
      tooltip: {
        trigger: 'item',
      },

      series: [
        {
          type: 'gauge',

          progress: {
            show: true,
          },

          detail: {
            valueAnimation: true,
            formatter: '{value}%',
          },

          data: [
            {
              value: Math.round(
                this.benchmarkData.topPerformerPercent || 0
              ),

              name: 'Top Performers',
            },
          ],
        },
      ],
    };

    this.buildReferenceCharts();
  }

  private buildReferenceCharts(): void {
    const deaRow = this.findRawComparisonRow(['d€a', 'dea']);
    const iofcRow = this.findRawComparisonRow(['iofc']);

    this.overviewDeaChart = this.buildBenchmarkBarChart('D€A', deaRow);
    this.overviewIofcChart = this.buildBenchmarkBarChart('IOFC', iofcRow);
    this.marketDeaChart = this.buildBenchmarkBarChart('D€A at market price', deaRow, 1.08);
    this.marketIofcChart = this.buildBenchmarkBarChart('IOFC at market price', iofcRow, 1.12);
    this.milkScatterChart = this.buildMilkScatterChart();
    this.feedScatterChart = this.buildFeedScatterChart();
    this.radarComparisonChart = this.buildRadarChart();
    this.robotScatterChart = this.buildRobotScatterChart();
    this.milkingChart = this.buildBenchmarkBarChart('Mungiture', this.findRawComparisonRow(['mungiture']));
  }

  private findRawComparisonRow(keys: string[]): any | null {
    const rows = this.benchmarkData?.benchmarkComparison || [];
    return rows.find((row) => {
      const label = String(row.kpiName || '').toLowerCase();
      return keys.some((key) => label.includes(key.toLowerCase()));
    }) || null;
  }

  private buildBenchmarkBarChart(title: string, row: any | null, multiplier = 1): EChartsOption {
    const values = row
      ? [
          Number(row.bottom25PercentValue || 0) * multiplier,
          Number(row.marketAverageValue || 0) * multiplier,
          Number(row.top25PercentValue || 0) * multiplier,
          Number(row.yourFarmValue || 0) * multiplier,
        ]
      : [];

    return {
      title: {
        text: title,
        left: 'center',
        textStyle: { color: 'var(--text)', fontSize: 15, fontWeight: 700 },
      },
      grid: { left: 44, right: 20, top: 48, bottom: 36 },
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: ['Flop 25%', 'Media', 'Top 25%', 'Your Data'],
        axisLabel: { color: 'var(--text3)', fontSize: 11 },
        axisTick: { show: false },
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: 'var(--text3)', fontSize: 11 },
        splitLine: { lineStyle: { color: 'rgba(128,128,128,0.18)' } },
      },
      series: [
        {
          type: 'bar',
          barWidth: 42,
          data: values.map((value, index) => ({
            value,
            itemStyle: {
              color: ['#d84242', '#fff45b', '#6fd64d', '#78a8df'][index],
            },
          })),
          label: {
            show: true,
            position: 'top',
            formatter: ({ value }: any) => Number(value || 0).toFixed(2),
            color: 'var(--text3)',
            fontSize: 11,
          },
        },
      ],
    };
  }

  private buildMilkScatterChart(): EChartsOption {
    const ranking = this.benchmarkData?.companyRanking || [];
    const points = ranking.map((item, index) => [
      0.26 + index * 0.025,
      Math.max(24, 32 + Number(item.iofcValue || 0) / 35),
      item.companyName,
    ]);

    return this.buildScatterChart('Litri latte / EUR litro latte', 'EUR litro latte', 'Litri latte', points);
  }

  private buildFeedScatterChart(): EChartsOption {
    const ranking = this.benchmarkData?.companyRanking || [];
    const points = ranking.map((item, index) => [
      150 + index * 12,
      Math.max(1, 1.45 + Number(item.iofcValue || 0) / 900),
      item.companyName,
    ]);

    return this.buildScatterChart('GIM / Feed efficiency', 'GIM', 'Feed efficiency', points);
  }

  private buildRobotScatterChart(): EChartsOption {
    const ranking = this.benchmarkData?.companyRanking || [];
    const points = ranking.map((item, index) => [
      46 + index * 3,
      Math.max(1200, 1700 + Number(item.iofcValue || 0)),
      item.companyName,
    ]);

    return this.buildScatterChart('Kg latte / vacche munte per robot', 'Vacche munte per robot', 'Kg per robot', points);
  }

  private buildScatterChart(title: string, xName: string, yName: string, points: any[]): EChartsOption {
    return {
      title: {
        text: title,
        left: 'center',
        textStyle: { color: 'var(--text)', fontSize: 15, fontWeight: 700 },
      },
      grid: { left: 58, right: 24, top: 48, bottom: 42 },
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => `${params.data?.[2] || 'Company'}<br/>${xName}: ${Number(params.data?.[0] || 0).toFixed(2)}<br/>${yName}: ${Number(params.data?.[1] || 0).toFixed(2)}`,
      },
      xAxis: {
        name: xName,
        type: 'value',
        nameLocation: 'middle',
        nameGap: 28,
        axisLabel: { color: 'var(--text3)', fontSize: 11 },
        splitLine: { lineStyle: { color: 'rgba(128,128,128,0.16)' } },
      },
      yAxis: {
        name: yName,
        type: 'value',
        axisLabel: { color: 'var(--text3)', fontSize: 11 },
        splitLine: { lineStyle: { color: 'rgba(128,128,128,0.16)' } },
      },
      series: [
        {
          type: 'scatter',
          symbolSize: 13,
          data: points,
          itemStyle: { color: '#79b5e8', borderColor: '#3276d2', borderWidth: 2 },
        },
        {
          type: 'line',
          data: points.map((point) => [point[0], point[1]]),
          symbol: 'none',
          lineStyle: { color: '#73d9cf', type: 'dotted', width: 2 },
        },
      ],
    };
  }

  private buildRadarChart(): EChartsOption {
    const rows = ['gim', 'iofc', 'cll', 'crep', 'latte']
      .map((key) => this.findRawComparisonRow([key]))
      .filter(Boolean);
    const sourceRows = rows.length ? rows : (this.benchmarkData?.benchmarkComparison || []).slice(0, 5);
    const indicators = sourceRows.map((row) => ({ name: row.kpiName, max: 160 }));
    const normalize = (value: number, avg: number) => avg ? Math.min(160, Math.max(20, (value / avg) * 100)) : 0;

    return {
      tooltip: {},
      legend: {
        bottom: 0,
        data: ['Top 25%', 'Aziende 50%', 'Flop 25%', 'Azienda media', 'Dati aziendali'],
        textStyle: { color: 'var(--text3)', fontSize: 11 },
      },
      radar: {
        indicator: indicators,
        radius: '62%',
        axisName: { color: 'var(--text3)', fontSize: 11 },
        splitArea: {
          areaStyle: { color: ['rgba(216,66,66,0.26)', 'rgba(255,244,91,0.45)', 'rgba(111,214,77,0.34)'] },
        },
      },
      series: [
        {
          type: 'radar',
          data: [
            {
              name: 'Top 25%',
              value: sourceRows.map((row) => normalize(Number(row.top25PercentValue || 0), Number(row.marketAverageValue || 0))),
              areaStyle: { color: 'rgba(111,214,77,0.24)' },
              lineStyle: { color: '#6fd64d' },
            },
            {
              name: 'Aziende 50%',
              value: sourceRows.map(() => 115),
              areaStyle: { color: 'rgba(255,244,91,0.2)' },
              lineStyle: { color: '#d2c63b' },
            },
            {
              name: 'Flop 25%',
              value: sourceRows.map((row) => normalize(Number(row.bottom25PercentValue || 0), Number(row.marketAverageValue || 0))),
              areaStyle: { color: 'rgba(216,66,66,0.16)' },
              lineStyle: { color: '#d84242' },
            },
            {
              name: 'Azienda media',
              value: sourceRows.map(() => 100),
              lineStyle: { color: '#9aa4b2', type: 'dashed' },
            },
            {
              name: 'Dati aziendali',
              value: sourceRows.map((row) => normalize(Number(row.yourFarmValue || 0), Number(row.marketAverageValue || 0))),
              lineStyle: { color: '#2f9f9a', width: 4 },
              itemStyle: { color: '#2f9f9a' },
            },
          ],
        },
      ],
    };
  }

  get benchmarkSummary(): Array<any> {
    if (!this.benchmarkData?.kpiSummary) {
      return [];
    }

    return this.benchmarkData.kpiSummary.map((kpi) => ({
      label: kpi.label,
      value: Number(kpi.value || 0).toFixed(2),
      suffix: kpi.suffix,
      theme: kpi.theme,
      delta: kpi.delta
        ? Number(kpi.delta).toFixed(2)
        : null,
    }));
  }

  get benchmarkComparisonRows(): Array<any> {
    if (!this.benchmarkData?.benchmarkComparison) {
      return [];
    }

    return this.benchmarkData.benchmarkComparison.map((row) => ({
      label: row.kpiName,
      yourFarm: Number(row.yourFarmValue || 0).toFixed(2),
      marketAvg: Number(row.marketAverageValue || 0).toFixed(2),
      top25: Number(row.top25PercentValue || 0).toFixed(2),
      bottom25: Number(row.bottom25PercentValue || 0).toFixed(2),

      deviation: `${
        row.deviationPercent > 0 ? '+' : ''
      }${Number(row.deviationPercent || 0).toFixed(1)}%`,

      status: row.statusBadge || 'average',
    }));
  }

  get marketComparisonRows(): Array<any> {
    return this.benchmarkComparisonRows.filter((row) =>
      ['iofc', 'd€a', 'dea', 'raz'].some((key) => String(row.label).toLowerCase().includes(key))
    );
  }

  get robotRows(): Array<any> {
    const lookup = ['mungiture', 'rifiuti', 'vacche per robot', 'kg per robot', 'kg mangime'];
    const rows = lookup
      .map((key) => this.benchmarkComparisonRows.find((row) => String(row.label).toLowerCase().includes(key)))
      .filter(Boolean);

    return rows.length ? rows : [
      { label: 'Mungiture', yourFarm: '-', marketAvg: '-', top25: '-', bottom25: '-', deviation: '-' },
      { label: 'Rifiuti', yourFarm: '-', marketAvg: '-', top25: '-', bottom25: '-', deviation: '-' },
      { label: 'Vacche per robot', yourFarm: '-', marketAvg: '-', top25: '-', bottom25: '-', deviation: '-' },
      { label: 'Kg per robot', yourFarm: '-', marketAvg: '-', top25: '-', bottom25: '-', deviation: '-' },
      { label: 'Kg mangime', yourFarm: '-', marketAvg: '-', top25: '-', bottom25: '-', deviation: '-' },
    ];
  }

  get hasCostBreakdownData(): boolean {
    return !!this.benchmarkData?.costBreakdown?.some((item) => Number(item.amount || 0) > 0);
  }

  get rankingRows(): Array<any> {
    if (!this.benchmarkData?.companyRanking) {
      return [];
    }

    return this.benchmarkData.companyRanking.map((item) => ({
      rank: item.rank,
      company: item.companyName,
      value: Number(item.iofcValue || 0).toFixed(2),
    }));
  }

  get recentReports(): Array<any> {
    if (!this.benchmarkData?.recentReports) {
      return [];
    }

    return this.benchmarkData.recentReports.map((report) => ({
      date: new Date(report.reportDate).toLocaleDateString(),
      company: report.companyName,
      ration: report.rationName,
      group: report.animalGroup,
      animals: report.numberOfAnimals,
      avgMilk: Number(report.averageMilkPerDay || 0).toFixed(2),
      iofc: Number(report.iofcValue || 0).toFixed(2),
    }));
  }

  exportPdf(): void {
    if (!this.benchmarkData) {
      this.toast.error('No data to export.');
      return;
    }

    this.toast.info('PDF export feature coming soon.');
  }

  exportExcel(): void {
    if (!this.benchmarkData) {
      this.toast.error('No data to export.');
      return;
    }

    this.toast.info('Excel export feature coming soon.');
  }
}
