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
import { AggregatedArchiveItem, AggregatedReportItem } from '../../../core/models/dashboarddata';
import { forkJoin } from 'rxjs';
import { ToastService } from '../../../shared/services/toast.service';
import { PERMISSIONS } from '../../../core/constants/permissions.constants';

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
  editableArchive: Record<string, { rationName: string; animalCount: number; avgMilkPerDay: number }> = {};
  canExportReports = false;
  canSaveArchive = false;

  costIncomeChart: EChartsOption = {};
  marginTrendChart: EChartsOption = {};

  constructor(
    private store: Store,
    private commonService: CommonService,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.canExportReports = this.commonService.hasAnyPermission(
      [PERMISSIONS.ReportsView, PERMISSIONS.ReportsAdd, PERMISSIONS.ReportsEdit],
      false
    );
    this.canSaveArchive = this.commonService.checkPermission(PERMISSIONS.ReportsEdit, false);
    if (!this.commonService.checkPermission(PERMISSIONS.ReportsView, false)) {
      return;
    }
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
        this.columns = ['Period', 'Reports', 'Animals', 'Avg Milk/Day', 'IOFC', 'D&A Milk', 'Cost'];
        this.columnFields = ['periodLabel', 'reports', 'animalCount', 'avgMilkPerDay', 'iofc', 'deaMilk', 'cost'];

        this.marginTrendChart = {
          tooltip: { trigger: 'axis' },
          xAxis: { type: 'category', data: data.map((d) => d.periodLabel) },
          yAxis: { type: 'value' },
          series: [
            { name: 'IOFC', type: 'line', smooth: true, data: data.map((d) => d.iofc) },
            { name: 'D&A Milk', type: 'line', smooth: true, data: data.map((d) => d.deaMilk) },
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
            this.editableArchive = {};
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
    const payload = {
      year: this.selectedYear,
      period: this.selectedPeriod,
      companyId: null,
    };

    forkJoin([
      this.commonService.getCompanyReport(payload),
      this.commonService.getCompanyArchive(payload),
    ]).subscribe({
      next: ([reportRes, archiveRes]) => {
        const data = reportRes?.isSuccess && Array.isArray(reportRes.data) ? reportRes.data : [];
        this.reports = data;
        this.columns = ['Period', 'Reports', 'Animals', 'Avg Milk/Day', 'IOFC', 'D&A Milk', 'Cost'];
        this.columnFields = ['periodLabel', 'reports', 'animalCount', 'avgMilkPerDay', 'iofc', 'deaMilk', 'cost'];

        this.marginTrendChart = {
          tooltip: { trigger: 'axis' },
          xAxis: { type: 'category', data: data.map((d) => d.periodLabel) },
          yAxis: { type: 'value' },
          series: [
            { name: 'IOFC', type: 'line', smooth: true, data: data.map((d) => d.iofc) },
            { name: 'D&A Milk', type: 'line', smooth: true, data: data.map((d) => d.deaMilk) },
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

        this.archive = archiveRes?.isSuccess && Array.isArray(archiveRes.data) ? archiveRes.data : [];
        this.editableArchive = {};
        this.archive.forEach((row) => {
          this.editableArchive[row.reportDetailId] = {
            rationName: row.rationName,
            animalCount: row.animalCount,
            avgMilkPerDay: row.avgMilkPerDay,
          };
        });

        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  exportCurrentView(): void {
    const payload = {
      year: this.selectedYear,
      period: this.selectedPeriod,
      companyId: null,
    };

    if (this.isAdmin) {
      this.commonService.exportAggregatedReportCsv(payload).subscribe({
        next: (blob) => {
          this.downloadBlob(blob, `aggregated-report-${this.selectedYear}-${this.selectedPeriod.toLowerCase()}.csv`);
          this.toast.success('Aggregated CSV exported successfully.');
        },
        error: () => this.toast.error('Failed to export aggregated CSV.'),
      });
      return;
    }

    this.commonService.exportCompanyReportPdf(payload).subscribe({
      next: (blob) => {
        this.downloadBlob(blob, `company-report-${this.selectedYear}-${this.selectedPeriod.toLowerCase()}.pdf`);
        this.toast.success('Company PDF exported successfully.');
      },
      error: () => this.toast.error('Failed to export company PDF.'),
    });
  }

  exportAdminPdf(): void {
    if (!this.isAdmin) {
      return;
    }

    const payload = {
      year: this.selectedYear,
      period: this.selectedPeriod,
      companyId: null,
    };

    this.commonService.exportAggregatedReportPdf(payload).subscribe({
      next: (blob) => {
        this.downloadBlob(blob, `aggregated-report-${this.selectedYear}-${this.selectedPeriod.toLowerCase()}.pdf`);
        this.toast.success('Aggregated PDF exported successfully.');
      },
      error: () => this.toast.error('Failed to export aggregated PDF.'),
    });
  }

  saveArchiveRow(row: AggregatedArchiveItem): void {
    if (!this.commonService.checkPermission(PERMISSIONS.ReportsEdit)) {
      return;
    }
    const edit = this.editableArchive[row.reportDetailId];
    if (!edit) {
      return;
    }

    this.commonService
      .updateCompanyArchive({
        reportDetailId: row.reportDetailId,
        rationName: edit.rationName,
        animalCount: Number(edit.animalCount),
        avgMilkPerDay: Number(edit.avgMilkPerDay),
      })
      .subscribe({
        next: (res) => {
          if (res?.isSuccess) {
            row.rationName = edit.rationName;
            row.animalCount = Number(edit.animalCount);
            row.avgMilkPerDay = Number(edit.avgMilkPerDay);
            this.toast.success('Archive record updated successfully.');
          } else {
            this.toast.error(res?.message || 'Failed to update archive record.');
          }
        },
        error: () => this.toast.error('Failed to update archive record.'),
      });
  }

  private downloadBlob(blob: Blob, fileName: string): void {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    URL.revokeObjectURL(url);
  }
}
