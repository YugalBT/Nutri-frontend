import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { NgxEchartsModule } from 'ngx-echarts';
import type { EChartsOption } from 'echarts';
import { HttpService } from '../../shared/services/http.service';
import { CommonService } from '../../shared/services/common.service';
import { API_ENDPOINTS } from '../../core/constants/api-endpoints';
import { PERMISSIONS } from '../../core/constants/permissions.constants';
import { TranslatePipe } from '../../i18n/translate.pipe';
import { TranslateService } from '../../i18n/translate.service';
import { Constants } from '../../shared/utils/constants/constants';

interface PartiRow {
  monthNumber: number;
  calvingsCount: number;
  previstVacche: number | null;
  previsteManze: number | null;
}

@Component({
  selector: 'app-parti-list',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxEchartsModule, TranslatePipe],
  template: `
    <div class="pagecls">
      <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <h3 class="page-title mb-0">{{ 'parti.list.title' | translate }}</h3>
        <div class="d-flex align-items-center gap-2">
          <ng-container *ngIf="isSuperAdmin && companies.length > 0">
            <label class="form-label mb-0 text-muted">{{ 'dailyEntry.filters.company' | translate }}</label>
            <select class="form-select form-select-sm" style="width:220px" [(ngModel)]="selectedCompanyId" (change)="onCompanyChange()">
              <option *ngFor="let c of companies" [value]="c.id">{{ c.name }}</option>
            </select>
          </ng-container>
          <label class="form-label mb-0 text-muted">{{ 'common.year' | translate }}</label>
          <select class="form-select form-select-sm" style="width:100px" [(ngModel)]="year" (change)="load()">
            <option *ngFor="let y of years" [value]="y">{{ y }}</option>
          </select>
          <button class="btn add-btn btn-sm" (click)="savePrevisti()">
            <i class="bi bi-floppy me-1"></i>{{ 'common.save' | translate }}
          </button>
        </div>
      </div>

      <div *ngIf="isLoading" class="text-center py-5">
        <div class="spinner-border text-primary"></div>
      </div>

      <ng-container *ngIf="!isLoading">
        <div class="table-card mb-4">
          <div class="table-responsive">
            <table class="table table-hover table-sm align-middle mb-0">
              <thead class="table-light">
                <tr>
                  <th>{{ 'common.month' | translate }}</th>
                  <th class="text-center">{{ 'parti.columns.calvings' | translate }}</th>
                  <th class="text-center" style="width:130px">{{ 'parti.columns.previstVacche' | translate }}</th>
                  <th class="text-center" style="width:130px">{{ 'parti.columns.previsteManze' | translate }}</th>
                  <th class="text-center">{{ 'common.total' | translate }}</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let row of rows; let i = index">
                  <td>{{ monthLabel(i + 1) }}</td>
                  <td class="text-center">
                    <span class="badge" [class.bg-success]="row.calvingsCount > 0" [class.bg-secondary]="row.calvingsCount === 0">
                      {{ row.calvingsCount }}
                    </span>
                  </td>
                  <td class="text-center">
                    <input type="number" min="0" class="form-control form-control-sm text-center"
                      style="width:90px;margin:auto"
                      [(ngModel)]="row.previstVacche"
                      (ngModelChange)="buildChart()">
                  </td>
                  <td class="text-center">
                    <input type="number" min="0" class="form-control form-control-sm text-center"
                      style="width:90px;margin:auto"
                      [(ngModel)]="row.previsteManze"
                      (ngModelChange)="buildChart()">
                  </td>
                  <td class="text-center fw-bold">
                    {{ (row.previstVacche ?? 0) + (row.previsteManze ?? 0) }}
                  </td>
                </tr>
                <tr class="fw-bold table-light">
                  <td>{{ 'common.total' | translate }}</td>
                  <td class="text-center">{{ total }}</td>
                  <td class="text-center">{{ totalPrevistVacche }}</td>
                  <td class="text-center">{{ totalPrevisteManze }}</td>
                  <td class="text-center">{{ grandTotal }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="table-card">
          <h6 class="mb-3 text-muted">{{ 'parti.chart.title' | translate }}</h6>
          <div echarts [options]="chartOption" style="height:260px;"></div>
        </div>
      </ng-container>
    </div>
  `
})
export class PartiListComponent implements OnInit, OnDestroy {
  year = new Date().getFullYear();
  years: number[] = [];
  rows: PartiRow[] = [];
  isLoading = false;
  chartOption: EChartsOption = {};
  isSuperAdmin = false;
  companies: { id: string; name: string }[] = [];
  selectedCompanyId = '';
  private subs: Subscription[] = [];
  private langSub?: Subscription;

  constructor(
    private http: HttpService,
    private commonService: CommonService,
    private translate: TranslateService
  ) {
    const cur = new Date().getFullYear();
    this.years = [cur - 2, cur - 1, cur, cur + 1];
  }

  ngOnInit(): void {
    if (!this.commonService.checkPermission(PERMISSIONS.PartiView, false)) return;
    this.isSuperAdmin = localStorage.getItem(Constants.IsSuperAdmin) === 'true';
    this.langSub = this.translate.lang$.subscribe(() => this.buildChart());

    if (this.isSuperAdmin) {
      const sub = this.commonService.getCompanyDropdown().subscribe({
        next: (res) => {
          this.companies = res?.data ?? [];
          if (this.companies.length > 0) {
            this.selectedCompanyId = this.companies[0].id;
          }
          this.load();
        },
        error: () => this.load()
      });
      this.subs.push(sub);
      return;
    }

    this.load();
  }

  get total(): number {
    return this.rows.reduce((s, r) => s + r.calvingsCount, 0);
  }

  get totalPrevistVacche(): number {
    return this.rows.reduce((s, r) => s + (r.previstVacche ?? 0), 0);
  }

  get totalPrevisteManze(): number {
    return this.rows.reduce((s, r) => s + (r.previsteManze ?? 0), 0);
  }

  get grandTotal(): number {
    return this.totalPrevistVacche + this.totalPrevisteManze;
  }

  monthLabel(m: number): string {
    return new Intl.DateTimeFormat(undefined, { month: 'short' })
      .format(new Date(2000, m - 1, 1));
  }

  onCompanyChange(): void {
    this.load();
  }

  private storageKey(): string {
    return `parti_previsti_${this.year}_${this.selectedCompanyId || 'mine'}`;
  }

  private loadPrevisti(): Record<number, { vacche: number | null; manze: number | null }> {
    try {
      return JSON.parse(localStorage.getItem(this.storageKey()) || '{}');
    } catch {
      return {};
    }
  }

  savePrevisti(): void {
    const data: Record<number, { vacche: number | null; manze: number | null }> = {};
    this.rows.forEach(r => {
      data[r.monthNumber] = { vacche: r.previstVacche, manze: r.previsteManze };
    });
    localStorage.setItem(this.storageKey(), JSON.stringify(data));
  }

  load(): void {
    this.isLoading = true;
    const companyQuery = this.isSuperAdmin && this.selectedCompanyId
      ? `&companyId=${this.selectedCompanyId}`
      : '';
    this.http.get<any>(`${API_ENDPOINTS.DASHBOARD.GET_HEALTH_MONTHLY}?year=${this.year}${companyQuery}`)
      .subscribe({
        next: (res) => {
          const data: any[] = res?.data ?? [];
          const previsti = this.loadPrevisti();
          const baseRows: PartiRow[] = data.length > 0
            ? data.map(d => ({
                monthNumber: d.monthNumber,
                calvingsCount: d.calvingsCount ?? 0,
                previstVacche: previsti[d.monthNumber]?.vacche ?? null,
                previsteManze: previsti[d.monthNumber]?.manze ?? null,
              }))
            : Array.from({ length: 12 }, (_, i) => ({
                monthNumber: i + 1,
                calvingsCount: 0,
                previstVacche: previsti[i + 1]?.vacche ?? null,
                previsteManze: previsti[i + 1]?.manze ?? null,
              }));
          this.rows = baseRows;
          this.buildChart();
          this.isLoading = false;
        },
        error: () => { this.isLoading = false; }
      });
  }

  buildChart(): void {
    const labels = this.rows.map((_, i) => this.monthLabel(i + 1));
    const values = this.rows.map(r => r.calvingsCount);
    const prevVacche = this.rows.map(r => r.previstVacche ?? 0);
    const prevManze = this.rows.map(r => r.previsteManze ?? 0);
    this.chartOption = {
      tooltip: { trigger: 'axis' },
      legend: { data: [
        this.translate.instant('parti.columns.calvings'),
        this.translate.instant('parti.columns.previstVacche'),
        this.translate.instant('parti.columns.previsteManze'),
      ]},
      xAxis: { type: 'category', data: labels },
      yAxis: { type: 'value', minInterval: 1 },
      series: [
        { name: this.translate.instant('parti.columns.calvings'), type: 'bar', data: values, itemStyle: { color: '#4caf50' } },
        { name: this.translate.instant('parti.columns.previstVacche'), type: 'bar', data: prevVacche, itemStyle: { color: '#1d6b8f' } },
        { name: this.translate.instant('parti.columns.previsteManze'), type: 'bar', data: prevManze, itemStyle: { color: '#f28c38' } },
      ]
    };
  }

  ngOnDestroy(): void {
    this.langSub?.unsubscribe();
    this.subs.forEach(s => s.unsubscribe());
  }
}
