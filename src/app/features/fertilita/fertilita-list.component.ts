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


@Component({
  selector: 'app-fertilita-list',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxEchartsModule, TranslatePipe],
  template: `
    <div class="pagecls">
      <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <h3 class="page-title mb-0">{{ 'fertilita.list.title' | translate }}</h3>
        <div class="d-flex align-items-center gap-2">
          <label class="form-label mb-0 text-muted">{{ 'common.year' | translate }}</label>
          <select class="form-select form-select-sm" style="width:100px" [(ngModel)]="year" (change)="load()">
            <option *ngFor="let y of years" [value]="y">{{ y }}</option>
          </select>
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
                  <th class="text-center">{{ 'fertilita.columns.abortions' | translate }}</th>
                  <th class="text-center">{{ 'fertilita.columns.calvings' | translate }}</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let row of rows; let i = index">
                  <td>{{ monthLabel(i + 1) }}</td>
                  <td class="text-center">
                    <span class="badge" [class.bg-danger]="row.abortions > 0" [class.bg-secondary]="row.abortions === 0">
                      {{ row.abortions }}
                    </span>
                  </td>
                  <td class="text-center">
                    <span class="badge" [class.bg-success]="row.calvingsCount > 0" [class.bg-secondary]="row.calvingsCount === 0">
                      {{ row.calvingsCount }}
                    </span>
                  </td>
                </tr>
                <tr class="fw-bold table-light">
                  <td>{{ 'common.total' | translate }}</td>
                  <td class="text-center">{{ totalAbortions }}</td>
                  <td class="text-center">{{ totalCalvings }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="table-card">
          <h6 class="mb-3 text-muted">{{ 'fertilita.chart.title' | translate }}</h6>
          <div echarts [options]="chartOption" style="height:260px;"></div>
        </div>
      </ng-container>
    </div>
  `
})
export class FertilitaListComponent implements OnInit, OnDestroy {
  year = new Date().getFullYear();
  years: number[] = [];
  rows: { monthNumber: number; abortions: number; calvingsCount: number }[] = [];
  isLoading = false;
  chartOption: EChartsOption = {};
  private langSub?: Subscription;

  constructor(
    private http: HttpService,
    private commonService: CommonService,
    private translate: TranslateService
  ) {
    const cur = new Date().getFullYear();
    this.years = [cur - 2, cur - 1, cur];
  }

  ngOnInit(): void {
    if (!this.commonService.checkPermission(PERMISSIONS.FertilitaView, false)) return;
    this.langSub = this.translate.lang$.subscribe(() => this.buildChart());
    this.load();
  }

  get totalAbortions(): number { return this.rows.reduce((s, r) => s + r.abortions, 0); }
  get totalCalvings(): number { return this.rows.reduce((s, r) => s + r.calvingsCount, 0); }

  monthLabel(m: number): string {
    return new Intl.DateTimeFormat(undefined, { month: 'short' })
      .format(new Date(2000, m - 1, 1));
  }

  load(): void {
    this.isLoading = true;
    this.http.get<any>(`${API_ENDPOINTS.DASHBOARD.GET_HEALTH_MONTHLY}?year=${this.year}`)
      .subscribe({
        next: (res) => {
          const data: any[] = res?.data ?? [];
          this.rows = data.map(d => ({
            monthNumber: d.monthNumber,
            abortions: d.abortions ?? 0,
            calvingsCount: d.calvingsCount ?? 0
          }));
          if (this.rows.length === 0) {
            this.rows = Array.from({ length: 12 }, (_, i) => ({
              monthNumber: i + 1, abortions: 0, calvingsCount: 0
            }));
          }
          this.buildChart();
          this.isLoading = false;
        },
        error: () => { this.isLoading = false; }
      });
  }

  private buildChart(): void {
    const labels = this.rows.map((_, i) => this.monthLabel(i + 1));
    this.chartOption = {
      tooltip: { trigger: 'axis' },
      legend: { data: [
        this.translate.instant('fertilita.columns.abortions'),
        this.translate.instant('fertilita.columns.calvings')
      ]},
      xAxis: { type: 'category', data: labels },
      yAxis: { type: 'value', minInterval: 1 },
      series: [
        {
          name: this.translate.instant('fertilita.columns.abortions'),
          type: 'bar',
          data: this.rows.map(r => r.abortions),
          itemStyle: { color: '#e53935' }
        },
        {
          name: this.translate.instant('fertilita.columns.calvings'),
          type: 'line',
          data: this.rows.map(r => r.calvingsCount),
          itemStyle: { color: '#43a047' }
        }
      ]
    };
  }

  ngOnDestroy(): void {
    this.langSub?.unsubscribe();
  }
}
