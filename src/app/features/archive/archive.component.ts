import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { API_ENDPOINTS } from '../../core/constants/api-endpoints';
import { PERMISSIONS } from '../../core/constants/permissions.constants';
import { Constants } from '../../shared/utils/constants/constants';
import { TranslatePipe } from '../../i18n/translate.pipe';
import { TranslateService } from '../../i18n/translate.service';
import { ConfirmDialogService } from '../../shared/services/confirm-dialog.service';
import { CommonService } from '../../shared/services/common.service';
import { HttpService } from '../../shared/services/http.service';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-archive',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslatePipe],
  templateUrl: './archive.component.html',
  styleUrl: './archive.component.css',
})
export class ArchiveComponent implements OnInit, OnDestroy {
  records: any[] = [];
  totalRecords = 0;
  isLoading = false;
  isRecalculating = false;
  canRecalculate = false;
  isSuperAdmin = false;
  companies: { id: string; name: string }[] = [];
  selectedCompanyId = '';

  fromDate: string = this.getMonthStart();
  toDate: string = this.getToday();
  pageNo = 1;
  pageSize = 30;

  private subs: Subscription[] = [];

  constructor(
    private router: Router,
    private http: HttpService,
    private toast: ToastService,
    private confirm: ConfirmDialogService,
    private common: CommonService,
    private translate: TranslateService,
  ) {}

  t(key: string, fallback: string): string {
    const translated = this.translate.instant(key);
    return translated && translated !== key ? translated : fallback;
  }

  ngOnInit(): void {
    this.isSuperAdmin = localStorage.getItem(Constants.IsSuperAdmin) === 'true';
    this.canRecalculate = this.common.checkPermission(PERMISSIONS.ArchiveEdit, false);
    if (!this.common.checkPermission(PERMISSIONS.ArchiveView, false)) {
      return;
    }

    if (this.isSuperAdmin) {
      const sub = this.common.getCompanyDropdown().subscribe({
        next: (res) => {
          this.companies = res?.data ?? [];
          this.loadArchive();
        },
        error: () => this.loadArchive(),
      });
      this.subs.push(sub);
      return;
    }

    this.loadArchive();
  }

  loadArchive(): void {
    this.isLoading = true;
    const companyQuery = this.isSuperAdmin && this.selectedCompanyId
      ? `&companyId=${this.selectedCompanyId}`
      : '';
    const url = `${API_ENDPOINTS.DAY_DATA.ARCHIVE}?fromDate=${this.fromDate}&toDate=${this.toDate}&pageNo=${this.pageNo}&pageSize=${this.pageSize}${companyQuery}`;
    const sub = this.http.get<any>(url).subscribe({
      next: (res) => {
        this.records = res?.data ?? [];
        this.totalRecords = res?.totalRecords ?? 0;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
    this.subs.push(sub);
  }

  loadRecord(record: any): void {
    this.router.navigate(['/daily-entry'], {
      queryParams: {
        dayId: record.dayId,
        date: this.normalizeDateString(record?.date ?? record?.Date ?? ''),
      },
    });
  }

  bulkRecalculate(): void {
    if (!this.common.checkPermission(PERMISSIONS.ArchiveEdit)) {
      return;
    }
    this.confirm
      .confirm(
        this.translate
          .instant('archive.messages.bulkRecalculateConfirm')
          .replace('{fromDate}', this.fromDate)
          .replace('{toDate}', this.toDate),
      )
      .subscribe((confirmed) => {
        if (!confirmed) {
          return;
        }

        this.isRecalculating = true;
        const payload = {
          fromDate: this.fromDate,
          toDate: this.toDate,
        };
        const sub = this.http
          .post<any>(API_ENDPOINTS.DAY_DATA.BULK_RECALC, payload)
          .subscribe({
            next: (res) => {
              if (res.isSuccess) {
                this.toast.success(res.message);
                this.loadArchive();
              } else {
                this.toast.error(res.message);
              }
              this.isRecalculating = false;
            },
            error: () => {
              this.toast.error(this.translate.instant('archive.messages.recalculateFailed'));
              this.isRecalculating = false;
            },
          });
        this.subs.push(sub);
      });
  }

  onPageChange(page: number): void {
    this.pageNo = page;
    this.loadArchive();
  }

  onCompanyChange(): void {
    this.pageNo = 1;
    this.loadArchive();
  }

  getFirstCalvingPercent(record: any): number | null {
    const firstCalving = Number(record?.firstCalving ?? 0);
    const total = Number(record?.totalHeads ?? record?.totalCapi ?? 0);
    if (!Number.isFinite(firstCalving) || !Number.isFinite(total) || total <= 0) {
      return null;
    }
    const pct = (firstCalving / total) * 100;
    if (!Number.isFinite(pct) || pct < 0) {
      return null;
    }
    return pct;
  }

  private getMonthStart(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
  }

  private getToday(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  private normalizeDateString(value: unknown): string {
    if (!value) {
      return '';
    }

    const text = String(value).trim();
    if (/^\d{4}-\d{2}-\d{2}/.test(text)) {
      return text.slice(0, 10);
    }

    const parsed = new Date(text);
    if (Number.isNaN(parsed.getTime())) {
      return '';
    }

    return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}-${String(parsed.getDate()).padStart(2, '0')}`;
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }
}
