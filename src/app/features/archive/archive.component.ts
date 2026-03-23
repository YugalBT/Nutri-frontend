import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { FarmList } from '../../core/models/farm-list';
import { API_ENDPOINTS } from '../../core/constants/api-endpoints';
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
})
export class ArchiveComponent implements OnInit, OnDestroy {
  farmId!: string;
  selectedFarmId = '';
  farms: FarmList[] = [];
  records: any[] = [];
  totalRecords = 0;
  isLoading = false;
  isRecalculating = false;
  isSelectionLoading = false;
  needsSelection = false;

  fromDate: string = this.getMonthStart();
  toDate: string = new Date().toISOString().split('T')[0];
  pageNo = 1;
  pageSize = 30;

  private subs: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpService,
    private toast: ToastService,
    private confirm: ConfirmDialogService,
    private common: CommonService,
    private translate: TranslateService,
  ) {}

  ngOnInit(): void {
    const sub = this.route.queryParams.subscribe((params) => {
      this.farmId = params['farmId'];

      if (!this.farmId) {
        this.needsSelection = true;
        this.loadFarms();
        return;
      }

      this.needsSelection = false;
      this.selectedFarmId = this.farmId;
      this.pageNo = 1;
      this.loadArchive();
    });

    this.subs.push(sub);
  }

  private loadFarms(): void {
    this.isSelectionLoading = true;

    const sub = this.common.getFarmsList().subscribe({
      next: (res) => {
        this.farms = Array.isArray(res?.data) ? res.data : [];
        this.isSelectionLoading = false;
      },
      error: () => {
        this.farms = [];
        this.isSelectionLoading = false;
        this.toast.error(this.translate.instant('archive.messages.loadFarmsError'));
      },
    });

    this.subs.push(sub);
  }

  openSelectedArchive(): void {
    if (!this.selectedFarmId) {
      this.toast.warning(this.translate.instant('archive.messages.selectFarm'));
      return;
    }

    this.router.navigate(['/archive'], {
      queryParams: { farmId: this.selectedFarmId },
    });
  }

  loadArchive(): void {
    this.isLoading = true;
    const url = `${API_ENDPOINTS.DAY_DATA.ARCHIVE}?farmId=${this.farmId}&fromDate=${this.fromDate}&toDate=${this.toDate}&pageNo=${this.pageNo}&pageSize=${this.pageSize}`;
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
      queryParams: { farmId: this.farmId, dayId: record.dayId },
    });
  }

  bulkRecalculate(): void {
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
          farmId: this.farmId,
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

  private getMonthStart(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }
}
