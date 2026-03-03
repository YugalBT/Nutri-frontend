import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { NgxEchartsModule } from 'ngx-echarts';
import type { EChartsOption } from 'echarts';

import { SharedModule } from '../../../shared/shared.module';
import { ReusableTableComponent } from '../../../shared/components/reusable-table/reusable-table.component';
import { User } from '../../../state/auth/auth.models';
import { selectAuthUser } from '../../../state/auth/auth.selectors';
import { CommonService } from '../../../shared/services/common.service';
import { TechnicalReportService } from '../../../core/services/technical-report/technical-report.service';
import { AggregatedArchiveItem, AggregatedReportItem } from '../../../core/models/dashboarddata';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    DecimalPipe,
    NgxEchartsModule,
    ReusableTableComponent,
  ],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css'],
})
export class ReportsComponent implements OnInit {
  user: User | null = null;
  isLoading = false;

  selectedYear = new Date().getFullYear();
  selectedPeriod: 'Monthly' | 'Quarterly' | 'Annual' = 'Monthly';
  yearOptions = Array.from({ length: 7 }, (_, i) => new Date().getFullYear() - i);

  columns: string[] = [];
  columnFields: string[] = [];
  reports: any[] = [];
  archive: AggregatedArchiveItem[] = [];

  costIncomeChart: EChartsOption = {};
  marginTrendChart: EChartsOption = {};

  constructor(
    private store: Store,
    private commonService: CommonService,
    private technicalReportService: TechnicalReportService,
  ) {}

  ngOnInit(): void {
    this.store.select(selectAuthUser).subscribe((u) => {
      this.user = u;
      this.loadData();
    });
  }

  get isAdmin(): boolean {
    return (this.user?.roleType || '').toUpperCase() === 'ADMIN';
  }

  onFiltersChange(): void {
    this.loadData();
  }

  private loadData(): void {
    if (!this.user) {
      return;
    }

    this.isLoading = true;
    if (this.isAdmin) {
      this.loadAdminReports();
      return;
    }

    this.loadCompanyReports();
  }

  private loadAdminReports(): void {
    const payload = {
      year: this.selectedYear,
      period: this.selectedPeriod,
      companyId: null,
    };

    this.commonService.getAggregatedReport(payload).subscribe({
      next: (res) => {
        const data = res?.isSuccess && Array.isArray(res.data) ? res.data : [];
        this.reports = data;
        this.columns = ['Period', 'Reports', 'Animals', 'Avg Milk/Day', 'IOFC', 'D€A Milk', 'Cost'];
        this.columnFields = ['periodLabel', 'reports', 'animalCount', 'avgMilkPerDay', 'iofc', 'deaMilk', 'cost'];

        this.marginTrendChart = {
          tooltip: { trigger: 'axis' },
          xAxis: { type: 'category', data: data.map((d) => d.periodLabel) },
          yAxis: { type: 'value' },
          series: [
            { name: 'IOFC', type: 'line', smooth: true, data: data.map((d) => d.iofc) },
            { name: 'D€A Milk', type: 'line', smooth: true, data: data.map((d) => d.deaMilk) },
            { name: 'Cost', type: 'line', smooth: true, data: data.map((d) => d.cost) },
          ],
        };

        this.costIncomeChart = {
          tooltip: { trigger: 'axis' },
          legend: { data: ['Animals', 'Reports'] },
          xAxis: { type: 'category', data: data.map((d) => d.periodLabel) },
          yAxis: { type: 'value' },
          series: [
            { name: 'Animals', type: 'bar', data: data.map((d) => d.animalCount) },
            { name: 'Reports', type: 'bar', data: data.map((d) => d.reports) },
          ],
        };

        this.commonService.getAggregatedArchive(payload).subscribe({
          next: (archiveRes) => {
            this.archive = archiveRes?.isSuccess && Array.isArray(archiveRes.data) ? archiveRes.data : [];
            this.isLoading = false;
          },
          error: () => {
            this.archive = [];
            this.isLoading = false;
          },
        });
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  private loadCompanyReports(): void {
    this.technicalReportService.getTechnicalReport().subscribe({
      next: (res) => {
        const details = res?.isSuccess && Array.isArray(res.data) ? res.data : [];

        this.columns = ['Ration', 'Group', 'Animals', 'Avg Milk/Day', 'Milk Price', 'IOFC'];
        this.columnFields = ['rationName', 'animalGroup', 'animals', 'avgMilkPerDay', 'milkPrice', 'iofc'];

        this.reports = details.map((x: any) => {
          const iofc = (x.global || []).find((g: any) => (g.name || '').toUpperCase().includes('IOFC'))?.value || 0;
          return {
            rationName: x.rationName,
            animalGroup: x.animalGroup?.name,
            animals: x.animalGroup?.numberOfAnimals || 0,
            avgMilkPerDay: x.animalGroup?.avgMilkPerDay || 0,
            milkPrice: x.farm?.milkPrice || 0,
            iofc,
          };
        });

        this.costIncomeChart = {
          tooltip: { trigger: 'axis' },
          xAxis: { type: 'category', data: this.reports.map((r) => r.rationName) },
          yAxis: { type: 'value' },
          series: [
            { name: 'Milk Price', type: 'bar', data: this.reports.map((r) => r.milkPrice) },
            { name: 'IOFC', type: 'bar', data: this.reports.map((r) => r.iofc) },
          ],
        };

        this.marginTrendChart = {
          tooltip: { trigger: 'axis' },
          xAxis: { type: 'category', data: this.reports.map((r) => r.rationName) },
          yAxis: { type: 'value' },
          series: [
            { name: 'Avg Milk/Day', type: 'line', smooth: true, data: this.reports.map((r) => r.avgMilkPerDay) },
          ],
        };

        this.archive = [];
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  exportCurrentView(): void {
    const blob = new Blob([JSON.stringify({ reports: this.reports, archive: this.archive }, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `report-${this.selectedYear}-${this.selectedPeriod.toLowerCase()}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }
}
