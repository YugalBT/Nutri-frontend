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
import { PERMISSIONS } from '../../core/constants/permissions.constants';
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

@Component({
  selector: 'app-benchmark-analytics',
  standalone: true,
  imports: [CommonModule, FormsModule, SharedModule, NgxEchartsModule, DecimalPipe],
  templateUrl: './benchmark-analytics.component.html',
  styleUrls: ['./benchmark-analytics.component.css'],
})
export class BenchmarkAnalyticsComponent implements OnInit {
  user: User | null = null;
  selectedYear = new Date().getFullYear();
  selectedPeriod = 'Monthly';
  selectedCompany = 'All Companies';
  selectedRegion = 'All Regions';
  selectedAnimalGroup = 'All Groups';
  selectedCompareAgainst = 'Market Average';
  yearOptions = Array.from({ length: 7 }, (_, i) => new Date().getFullYear() - i);
  periodOptions = ['Monthly', 'Quarterly', 'Annual'];
  companyOptions = ['All Companies'];
  regionOptions = ['All Regions'];
  animalGroupOptions = ['All Groups'];
  compareAgainstOptions = ['Market Average', 'Top 25%', 'Bottom 25%'];
  isLoading = false;
  benchmarkData: BenchmarkAnalytics | null = null;

  trendChart: EChartsOption = {};
  rankingChart: EChartsOption = {};
  costBreakdownChart: EChartsOption = {};
  distributionChart: EChartsOption = {};

  constructor(
    private store: Store,
    private commonService: CommonService,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.store.select(selectAuthUser).subscribe((user) => {
      this.user = user;
      this.loadAnalytics();
    });
  }

  onFiltersChange(): void {
    this.loadAnalytics();
  }

  applyFilters(): void {
    this.loadAnalytics();
  }

  private loadAnalytics(): void {
    if (!this.user) {
      return;
    }

    this.isLoading = true;
    // Call new benchmark API endpoint
    this.commonService.getBenchmarkAnalytics(this.selectedYear).subscribe({
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

  private buildCharts(): void {
    if (!this.benchmarkData) return;

    const trendData = this.benchmarkData.trendData || [];
    
    // Trend Chart
    this.trendChart = {
      tooltip: { trigger: 'axis' },
      legend: { data: ['IOFC', 'Milk Production', 'Feed Cost'], textStyle: { color: 'var(--text)' } },
      xAxis: { 
        type: 'category', 
        data: trendData.map((point) => point.month),
        axisLabel: { color: 'var(--text3)' }
      },
      yAxis: { 
        type: 'value',
        axisLabel: { color: 'var(--text3)' }
      },
      series: [
        { 
          name: 'IOFC', 
          type: 'line', 
          smooth: true, 
          data: trendData.map((point) => point.iofc),
          lineStyle: { color: '#4dc0b5', width: 2 },
          areaStyle: { color: 'rgba(77, 192, 181, 0.1)' }
        },
        { 
          name: 'Milk Production', 
          type: 'line', 
          smooth: true, 
          data: trendData.map((point) => point.milkProduction),
          lineStyle: { color: '#43b4e3', width: 2 },
          areaStyle: { color: 'rgba(67, 180, 227, 0.1)' }
        },
        { 
          name: 'Feed Cost', 
          type: 'line', 
          smooth: true, 
          data: trendData.map((point) => point.feedCost),
          lineStyle: { color: '#f2a91d', width: 2 },
          areaStyle: { color: 'rgba(242, 169, 29, 0.1)' }
        },
      ],
    };

    // Ranking Chart
    const ranking = this.benchmarkData.companyRanking || [];
    this.rankingChart = {
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      xAxis: { type: 'value', axisLabel: { color: 'var(--text3)' } },
      yAxis: {
        type: 'category',
        data: ranking.map((item) => item.companyName),
        axisLabel: { color: 'var(--text3)', interval: 0 },
      },
      series: [{ 
        type: 'bar', 
        data: ranking.map((item) => item.iofcValue),
        itemStyle: { color: this.createGradient() }
      }],
    };

    // Cost Breakdown Chart (Pie)
    const costData = this.benchmarkData.costBreakdown || [];
    const costChartData = costData.map(item => ({
      name: item.category,
      value: item.amount
    }));

    this.costBreakdownChart = {
      tooltip: { trigger: 'item' },
      legend: { data: costData.map(x => x.category), textStyle: { color: 'var(--text)' } },
      series: [{
        type: 'pie',
        radius: ['40%', '70%'],
        data: costChartData,
        itemStyle: {
          color: (params: any) => ['#4dc0b5', '#4b8cf2', '#f2a91d', '#a78bfa'][params.dataIndex] || '#4dc0b5'
        }
      }]
    };

    // Distribution Chart
    this.distributionChart = {
      tooltip: { trigger: 'item' },
      series: [{
        type: 'gauge',
        progress: { itemStyle: { color: '#4dc0b5' } },
        axisLine: { lineStyle: { color: [[1, '#E8E8E8']] } },
        axisTick: { distance: 15 },
        splitLine: { distance: 15, length: 8 },
        axisLabel: { color: 'var(--text3)', distance: 20 },
        detail: { valueAnimation: true, formatter: '{value}%', color: 'var(--text)' },
        data: [{
          value: Math.round(this.benchmarkData.topPerformerPercent),
          name: 'Top Performers'
        }]
      }]
    };
  }

  private createGradient() {
    return 'linear-gradient(90deg, #4dc0b5 0%, #43b4e3 100%)';
  }

  get benchmarkSummary(): Array<any> {
    if (!this.benchmarkData?.kpiSummary) {
      return [];
    }

    return this.benchmarkData.kpiSummary.map(kpi => ({
      label: kpi.label,
      value: kpi.value.toFixed(2),
      suffix: kpi.suffix,
      theme: kpi.theme,
      delta: kpi.delta?.toFixed(2),
      deltaDirection: kpi.deltaDirection
    }));
  }

  get benchmarkComparisonRows(): Array<any> {
    if (!this.benchmarkData?.benchmarkComparison) {
      return [];
    }

    return this.benchmarkData.benchmarkComparison.map(row => ({
      label: row.kpiName,
      yourFarm: row.yourFarmValue.toFixed(2),
      marketAvg: row.marketAverageValue.toFixed(2),
      top25: row.top25PercentValue.toFixed(2),
      bottom25: row.bottom25PercentValue.toFixed(2),
      deviation: `${row.deviationPercent > 0 ? '+' : ''}${row.deviationPercent.toFixed(1)}%`,
      status: row.statusBadge
    }));
  }

  get rankingRows(): Array<any> {
    if (!this.benchmarkData?.companyRanking) {
      return [];
    }

    return this.benchmarkData.companyRanking.map((item) => ({
      rank: item.rank,
      company: item.companyName,
      value: item.iofcValue.toFixed(2)
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
      avgMilk: report.averageMilkPerDay.toFixed(2),
      iofc: report.iofcValue.toFixed(2)
    }));
  }

  exportPdf(): void {
    if (!this.benchmarkData) {
      this.toast.error('No data to export.');
      return;
    }
    this.toast.info('PDF export feature coming soon.');
    // Implementation for PDF export would go here
  }

  exportExcel(): void {
    if (!this.benchmarkData) {
      this.toast.error('No data to export.');
      return;
    }
    this.toast.info('Excel export feature coming soon.');
    // Implementation for Excel export would go here
  }
}

    const ranking = analytics?.rankingByIofc || [];
    this.rankingChart = {
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      xAxis: { type: 'value' },
      yAxis: {
        type: 'category',
        data: ranking.map((item: any) => item.companyName),
        axisLabel: { interval: 0 },
      },
      series: [{ type: 'bar', data: ranking.map((item: any) => item.iofc), itemStyle: { color: '#4dc0b5' } }],
    };

    const comparison = analytics?.companyComparison || [];
    this.comparisonChart = {
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      legend: { data: ['DEA', 'Cost'] },
      xAxis: {
        type: 'category',
        data: comparison.map((item: any) => item.companyName),
        axisLabel: { interval: 0, rotate: 30 },
      },
      yAxis: { type: 'value' },
      series: [
        { name: 'DEA', type: 'bar', data: comparison.map((item: any) => item.deaMilk) },
        { name: 'Cost', type: 'bar', data: comparison.map((item: any) => item.cost) },
      ],
    };
  }

  get benchmarkSummary(): Array<{ label: string; value: string; suffix?: string; theme?: string; delta?: string | null }> {
    const analytics = this.aggregatedAnalytics;
    const lastTrend = analytics?.monthlyTrend?.slice(-1)[0] || null;

    return [
      { label: 'Avg IOFC', value: lastTrend?.iofc?.toFixed(2) ?? '-', suffix: '€/cow/day', theme: 'teal', delta: analytics?.rankingByIofc?.length ? '+3.5% vs Market Avg' : null },
      { label: 'Avg DEA', value: lastTrend?.deaMilk?.toFixed(2) ?? '-', suffix: '€/cow/day', theme: 'blue', delta: analytics?.rankingByIofc?.length ? '+3.2% vs Market Avg' : null },
      { label: 'Avg Milk / Cow / Day', value: lastTrend?.avgMilkPerDay?.toFixed(2) ?? '-', suffix: 'kg', theme: 'violet', delta: analytics?.rankingByIofc?.length ? '+1.8% vs Market Avg' : null },
      { label: 'Feed Efficiency', value: analytics?.crep ? analytics.crep.toFixed(2) : '-', suffix: 'kg/kg DMI', theme: 'orange', delta: analytics?.rankingByIofc?.length ? '+4.1% vs Market Avg' : null },
      { label: 'Economic Margin', value: analytics?.pim ? analytics.pim.toFixed(2) : '-', suffix: '%', theme: 'green', delta: analytics?.rankingByIofc?.length ? '+1.9% vs Market Avg' : null },
    ];
  }

  get benchmarkComparisonRows(): Array<any> {
    return [
      { label: 'IOFC (€/cow/day)', yourFarm: this.benchmarkSummary[0]?.value, marketAvg: '10.10', top25: '11.56', bottom25: '8.90', deviation: '+0.35 (+3.47%)', status: 'Excellent' },
      { label: 'DEA (€/cow/day)', yourFarm: this.benchmarkSummary[1]?.value, marketAvg: '8.10', top25: '9.38', bottom25: '7.32', deviation: '+0.22 (+2.72%)', status: 'Good' },
      { label: 'Milk / Cow / Day (kg)', yourFarm: this.benchmarkSummary[2]?.value, marketAvg: '36.58', top25: '42.15', bottom25: '30.12', deviation: '+0.66 (+1.81%)', status: 'Good' },
      { label: 'Feed Efficiency (kg/kg)', yourFarm: this.benchmarkSummary[3]?.value, marketAvg: '1.50', top25: '1.80', bottom25: '1.20', deviation: '+0.11 (+7.33%)', status: 'Excellent' },
      { label: 'Feed Cost (€/cow/day)', yourFarm: '5.82', marketAvg: '6.10', top25: '5.45', bottom25: '6.85', deviation: '-0.28 (-4.59%)', status: 'Good' },
      { label: 'Milk Revenue (€/cow/day)', yourFarm: '18.25', marketAvg: '17.80', top25: '20.15', bottom25: '15.20', deviation: '+0.45 (+2.53%)', status: 'Good' },
    ];
  }

  get rankingRows(): Array<any> {
    const ranking = this.aggregatedAnalytics?.rankingByIofc || [];
    if (!ranking.length) {
      return [
        { rank: 1, company: 'Green Valley Farm', value: 12.45 },
        { rank: 2, company: 'Sunrise Dairy', value: 11.32 },
        { rank: 3, company: 'Your Farm', value: Number(this.benchmarkSummary[0]?.value) || 10.45, highlight: true },
        { rank: 4, company: 'Happy Cows Farm', value: 9.80 },
        { rank: 5, company: 'Blue Milk Farm', value: 8.95 },
      ];
    }

    return ranking.slice(0, 5).map((item: any, index: number) => ({
      rank: index + 1,
      company: item.companyName,
      value: item.iofc,
      highlight: index === 2,
    }));
  }

  get recentReports(): Array<any> {
    return [
      { date: 'May 01, 2026', company: 'Green Valley Farm', ration: 'Summer Ration', group: 'VL', animals: 125, avgMilk: 38.25, iofc: 10.85 },
      { date: 'Apr 01, 2026', company: 'Green Valley Farm', ration: 'Spring Ration', group: 'VL', animals: 120, avgMilk: 37.80, iofc: 10.32 },
      { date: 'Mar 01, 2026', company: 'Green Valley Farm', ration: 'Winter Ration', group: 'VL', animals: 118, avgMilk: 36.90, iofc: 9.95 },
      { date: 'Feb 01, 2026', company: 'Green Valley Farm', ration: 'Winter Ration', group: 'VL', animals: 115, avgMilk: 35.40, iofc: 9.42 },
      { date: 'Jan 01, 2026', company: 'Green Valley Farm', ration: 'Winter Ration', group: 'VL', animals: 110, avgMilk: 34.80, iofc: 9.12 },
    ];
  }

  exportPdf(): void {
    if (!this.user) {
      return;
    }
    this.commonService.exportAggregatedReportPdf({
      year: this.selectedYear,
      period: 'Annual',
      companyId: null,
    }).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `benchmark-analytics-${this.selectedYear}.pdf`;
        anchor.click();
        URL.revokeObjectURL(url);
        this.toast.success('Benchmark PDF exported successfully.');
      },
      error: () => this.toast.error('Failed to export benchmark PDF.'),
    });
  }
}
