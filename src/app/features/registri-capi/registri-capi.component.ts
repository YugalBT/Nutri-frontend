import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { HttpService } from '../../shared/services/http.service';
import { CommonService } from '../../shared/services/common.service';
import { API_ENDPOINTS } from '../../core/constants/api-endpoints';
import { TranslatePipe } from '../../i18n/translate.pipe';
import { TranslateService } from '../../i18n/translate.service';
import { Constants } from '../../shared/utils/constants/constants';

interface HerdRow {
  monthNumber: number;
  avgTotalCapi: number | null;
  avgInLattazione: number | null;
  avgDryAnimals: number | null;
  avgPregnantCows: number | null;
  entryCount: number;
}

@Component({
  selector: 'app-registri-capi',
  standalone: true,
  imports: [CommonModule, FormsModule, DecimalPipe, TranslatePipe],
  template: `
    <div class="pagecls">
      <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <h3 class="page-title mb-0">{{ 'registriCapi.title' | translate }}</h3>
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
        </div>
      </div>

      <div *ngIf="isLoading" class="text-center py-5">
        <div class="spinner-border text-primary"></div>
      </div>

      <ng-container *ngIf="!isLoading">
        <div class="table-card">
          <div class="table-responsive">
            <table class="table table-hover table-sm align-middle mb-0">
              <thead class="table-light">
                <tr>
                  <th>{{ 'common.month' | translate }}</th>
                  <th class="text-center">{{ 'registriCapi.columns.totalCapi' | translate }}</th>
                  <th class="text-center">{{ 'registriCapi.columns.inLattazione' | translate }}</th>
                  <th class="text-center">{{ 'registriCapi.columns.asciutte' | translate }}</th>
                  <th class="text-center">{{ 'registriCapi.columns.gravide' | translate }}</th>
                  <th class="text-center text-muted">{{ 'common.entries' | translate }}</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let row of rows; let i = index">
                  <td class="fw-500">{{ monthLabel(i + 1) }}</td>
                  <td class="text-center">{{ row.avgTotalCapi != null ? (row.avgTotalCapi | number:'1.0-1') : '-' }}</td>
                  <td class="text-center">{{ row.avgInLattazione != null ? (row.avgInLattazione | number:'1.0-1') : '-' }}</td>
                  <td class="text-center">{{ row.avgDryAnimals != null ? (row.avgDryAnimals | number:'1.0-1') : '-' }}</td>
                  <td class="text-center">{{ row.avgPregnantCows != null ? (row.avgPregnantCows | number:'1.0-1') : '-' }}</td>
                  <td class="text-center text-muted">{{ row.entryCount }}</td>
                </tr>
                <tr class="fw-bold table-light" *ngIf="rows.length > 0">
                  <td>{{ 'common.mean' | translate }}</td>
                  <td class="text-center">{{ avg('avgTotalCapi') }}</td>
                  <td class="text-center">{{ avg('avgInLattazione') }}</td>
                  <td class="text-center">{{ avg('avgDryAnimals') }}</td>
                  <td class="text-center">{{ avg('avgPregnantCows') }}</td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </ng-container>
    </div>
  `
})
export class RegistriCapiComponent implements OnInit, OnDestroy {
  year = new Date().getFullYear();
  years: number[] = [];
  rows: HerdRow[] = [];
  isLoading = false;
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
    this.years = [cur - 2, cur - 1, cur];
  }

  ngOnInit(): void {
    this.isSuperAdmin = localStorage.getItem(Constants.IsSuperAdmin) === 'true';
    this.langSub = this.translate.lang$.subscribe(() => {});

    if (this.isSuperAdmin) {
      const sub = this.commonService.getCompanyDropdown().subscribe({
        next: (res) => {
          this.companies = res?.data ?? [];
          if (this.companies.length > 0) this.selectedCompanyId = this.companies[0].id;
          this.load();
        },
        error: () => this.load()
      });
      this.subs.push(sub);
      return;
    }
    this.load();
  }

  monthLabel(m: number): string {
    return new Intl.DateTimeFormat(undefined, { month: 'short' }).format(new Date(2000, m - 1, 1));
  }

  onCompanyChange(): void {
    this.load();
  }

  load(): void {
    this.isLoading = true;
    const q = this.isSuperAdmin && this.selectedCompanyId ? `&companyId=${this.selectedCompanyId}` : '';
    this.http.get<any>(`${API_ENDPOINTS.DASHBOARD.GET_HERD_MONTHLY}?year=${this.year}${q}`).subscribe({
      next: (res) => {
        const data: any[] = res?.data ?? [];
        this.rows = data.map(d => ({
          monthNumber: d.monthNumber,
          avgTotalCapi: d.avgTotalCapi ?? null,
          avgInLattazione: d.avgInLattazione ?? null,
          avgDryAnimals: d.avgDryAnimals ?? null,
          avgPregnantCows: d.avgPregnantCows ?? null,
          entryCount: d.entryCount ?? 0,
        }));
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
  }

  avg(field: keyof HerdRow): string {
    const vals = this.rows.map(r => r[field] as number | null).filter(v => v != null) as number[];
    if (vals.length === 0) return '-';
    return (vals.reduce((s, v) => s + v, 0) / vals.length).toFixed(1);
  }

  ngOnDestroy(): void {
    this.langSub?.unsubscribe();
    this.subs.forEach(s => s.unsubscribe());
  }
}
