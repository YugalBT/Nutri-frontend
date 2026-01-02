import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { KpiAddEditComponent } from '../kpi-add-edit/kpi-add-edit.component';
import { SharedModule } from '../../../shared/shared.module';
import { ReusableTableComponent } from '../../../shared/components/reusable-table/reusable-table.component';
import { GlobalSearchComponent } from '../../../shared/components/global-search/global-search.component';
import { TranslateService } from '../../../i18n/translate.service';
import { KpiService } from '../../../core/services/day/kpi.service';
import { ToastService } from '../../../shared/services/toast.service';
import { ConfirmDialogService } from '../../../shared/services/confirm-dialog.service';
import { ApiResponse } from '../../../core/models/api-response';
import { CommonService } from '../../../shared/services/common.service';
import { PERMISSIONS } from '../../../core/constants/permissions.constants';
import { TranslatePipe } from '../../../i18n/translate.pipe';
import { KpiList } from '../../../core/models/day-list';



@Component({
  selector: 'app-kpi-list',
  standalone: true,
  imports: [
    SharedModule,
    ReusableTableComponent,
    GlobalSearchComponent,
    KpiAddEditComponent,
    TranslatePipe,
  ],
  templateUrl: './kpi-list.component.html',
  styleUrls: ['./kpi-list.component.css']
})
export class KpiListComponent implements OnInit, OnDestroy {

  columns: string[] = [];
  columnFields: string[] = [];

  kpis: KpiList[] = [];
  totalRecords = 0;
  pageSize = 5;
  pageIndex = 0;
  searchValue = '';
  filterStatus: number | null = 2;

  subs: Subscription[] = [];
  langSub!: Subscription;

  constructor(
    private translate: TranslateService,
    private kpiService: KpiService,
    private toast: ToastService,
    private confirm: ConfirmDialogService,
    private commonService: CommonService
  ) {
    this.setColumns();
    this.langSub = this.translate.lang$.subscribe(() => this.setColumns());
  }

  ngOnInit(): void {

if (
    !this.commonService.checkPermission(PERMISSIONS.KpiView) &&
    !this.commonService.checkPermission(PERMISSIONS.KpiDelete)
  ) {
    return;
  }
    this.loadKpis(1, this.pageSize);

    const sub = this.kpiService.kpisChanged$.subscribe(() => {
      this.loadKpis(this.pageIndex + 1, this.pageSize);
    });
    this.subs.push(sub);
  }

  private loadKpis(pageNo: number, recordPerPage: number): void {
    const payload = {
      pageNo,
      recordPerPage,
      searchValue: this.searchValue ?? '',
      status: this.filterStatus
    };

    const sub = this.kpiService.getkpiDetails(payload).subscribe({
      next: (res: ApiResponse<any>) => {
        this.kpis = res?.data ?? [];
        this.totalRecords = res?.totalRecords ?? 0;
      },
      error: (error: ApiResponse<any>) => {
        this.kpis = [];
      }
    });

    this.subs.push(sub);
  }

  onSearch(value: string): void {
    this.searchValue = value;
    this.pageIndex = 0;
    this.loadKpis(1, this.pageSize);
  }

  onStatusChange(status: number | null): void {
    this.filterStatus = status ?? 2;
    this.pageIndex = 0;
    this.loadKpis(1, this.pageSize);
  }

  clearFilters(): void {
    this.searchValue = '';
    this.filterStatus = 2;
    this.pageIndex = 0;
    this.loadKpis(1, this.pageSize);
  }

  onPageChange(event: { pageIndex: number; pageSize: number }): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadKpis(this.pageIndex + 1, this.pageSize);
  }

onToggleActive(event: { row: any; isActive: boolean }): void {

  if (!this.commonService.checkPermission(PERMISSIONS.KpiEdit)) {
    this.toast.warning('You do not have permission to change status');
    return;
  }

  event.row.isToggling = true;

  const id = event.row?.kpiid;
  if (!id) {
    this.toast.error("Invalid KPI id");
    event.row.isToggling = false;
    return;
  }

  const sub = this.kpiService.activeInActive(id).subscribe({
    next: res => {
      if (res.isSuccess) {
        this.toast.success(res.message);
        event.row.isActive = !event.row.isActive;
      } else {
        this.toast.error(res.message);
      }
    },
    error: () => {},
    complete: () => event.row.isToggling = false
  });

  this.subs.push(sub);
}


  onDelete(row: any): void {

    if (!this.commonService.checkPermission(PERMISSIONS.KpiDelete)) {
      this.toast.warning('You do not have delete permission');
      return;
    }

    const id = row?.kpiid; 
    if (!id) {
      this.toast.error("Invalid KPI id");
      return;
    }

    this.confirm.confirm("Are you sure you want to delete this record?")
      .subscribe(confirmed => {
        if (!confirmed) return;

        const sub = this.kpiService.deletekpis(id).subscribe({
          next: res => {
            res.isSuccess
              ? this.toast.success(res.message)
              : this.toast.error(res.message);

            this.kpiService.notifykpisChanged();
          },
          error: err => this.toast.error(err?.message)
        });

        this.subs.push(sub);
      });
  }


  private setColumns(): void {
  this.columns = [
    this.translate.instant('kpi.table.formulaName') ??"",
    this.translate.instant('kpi.table.kpiName')??"",
    this.translate.instant('kpi.table.status')??""
  ];

  this.columnFields = [
    'formulaName',
    'kpiname',
    'isActive'
  ];
}


  ngOnDestroy(): void {
    this.langSub?.unsubscribe();
    this.subs.forEach(s => s.unsubscribe());
  }
}
