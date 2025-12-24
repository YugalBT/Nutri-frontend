import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { DayAddEditComponent } from '../day-add-edit/day-add-edit.component';
import { SharedModule } from '../../../shared/shared.module';
import { ReusableTableComponent } from '../../../shared/components/reusable-table/reusable-table.component';
import { GlobalSearchComponent } from '../../../shared/components/global-search/global-search.component';
import { DayList } from '../../../core/models/day-list';
import { TranslateService } from '../../../i18n/translate.service';
import { DayService } from '../../../core/services/day/day.service';
import { ToastService } from '../../../shared/services/toast.service';
import { ConfirmDialogService } from '../../../shared/services/confirm-dialog.service';
import { ApiResponse } from '../../../core/models/api-response';
import { CommonService } from '../../../shared/services/common.service';
import { PERMISSIONS } from '../../../core/constants/permissions.constants';
import { TranslatePipe } from '../../../i18n/translate.pipe';


@Component({
  selector: 'app-day-list',
  standalone: true,
  imports: [
    SharedModule,
    ReusableTableComponent,
    GlobalSearchComponent,
    DayAddEditComponent,
    TranslatePipe
  ],
  templateUrl: './day-list.component.html',
  styleUrls: ['./day-list.component.css']
})
export class DayListComponent implements OnInit, OnDestroy {

  columns: string[] = [];
  columnFields: string[] = [];

  days: DayList[] = [];
  totalRecords = 0;
  pageSize = 5;
  pageIndex = 0;
  searchValue = '';
  filterStatus: number | null = 2;

  subs: Subscription[] = [];
  langSub!: Subscription;

  constructor(
    private translate: TranslateService,
    private dayService: DayService,
    private toast: ToastService,
    private confirm: ConfirmDialogService,
    private commonService : CommonService
  ) {
    this.setColumns();
    this.langSub = this.translate.lang$.subscribe(() => this.setColumns());
  }

  ngOnInit(): void {
    
    if(!this.commonService.checkPermission(PERMISSIONS.DayView)
      || !this.commonService.checkPermission(PERMISSIONS.DayDelete))
        return;
    this.loadDays(1, this.pageSize);

    const sub = this.dayService.daysChanged$.subscribe(() => {
      this.loadDays(this.pageIndex + 1, this.pageSize);
    });
    this.subs.push(sub);
  }

  private loadDays(pageNo: number, recordPerPage: number): void {
    const payload = {
      pageNo,
      recordPerPage,
      searchValue: this.searchValue ?? '',
      status: this.filterStatus
    };

    const sub = this.dayService.getDayDetails(payload).subscribe({
      next: (res: ApiResponse<any>) => {
        this.days = res?.data ?? [];
        this.totalRecords = res?.totalRecords ?? 0;
      },
      error: (error : ApiResponse<any>) => {
        this.days = [];
      }
    });

    this.subs.push(sub);
  }

  onSearch(value: string): void {
    this.searchValue = value;
    this.pageIndex = 0;
    this.loadDays(1, this.pageSize);
  }

  onStatusChange(status: number | null): void {
    this.filterStatus = status ?? 2;
    this.pageIndex = 0;
    this.loadDays(1, this.pageSize);
  }

  clearFilters(): void {
    this.searchValue = '';
    this.filterStatus = 2;
    this.pageIndex = 0;
    this.loadDays(1, this.pageSize);
  }

  onPageChange(event: { pageIndex: number; pageSize: number }): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadDays(this.pageIndex + 1, this.pageSize);
  }

  onToggleActive(event: { row: any; isActive: boolean }): void {
    event.row.isToggling = true;

    const id = event?.row?.dayId;
    if (!id) {
      this.toast.error("Invalid day id");
      return;
    }

    const sub = this.dayService.activeInActive(id).subscribe({
      next: (res: ApiResponse<any>) => {
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
    
    if(!this.commonService.checkPermission(PERMISSIONS.DayDelete))
        return;
    const id = row?.dayId;
    if (!id) {
      this.toast.error("Invalid day id");
      return;
    }

    this.confirm.confirm("Are you sure you want to delete this record?").subscribe((confirmed) => {
      if (!confirmed) return;

      const sub = this.dayService.deleteDays(id).subscribe({
        next: (res: ApiResponse<any>) => {
          res.isSuccess ? this.toast.success(res.message) : this.toast.error(res.message);
          this.dayService.notifydaysChanged();
        },
        error: (err) => this.toast.error(err?.message)
      });

      this.subs.push(sub);
    });
  }

  private setColumns(): void {
    this.columns = [
      'Farm Name',
      'Date',
      'Status'
    ];

    this.columnFields = [
      'farmName',
      'date',
      'isActive'
    ];
  }

  ngOnDestroy(): void {
    this.langSub?.unsubscribe();
    this.subs.forEach(s => s.unsubscribe());
  }
}
