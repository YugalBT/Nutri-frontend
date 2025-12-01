import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { TranslateService } from '../../../i18n/translate.service';
import { FarmService } from '../../../core/services/farm/farm.service';
import { ToastService } from '../../../shared/services/toast.service';
import { ConfirmDialogService } from '../../../shared/services/confirm-dialog.service';
import { FarmList } from '../../../core/models/farm-list';
import { FarmAddEditComponent } from '../farm-add-edit/farm-add-edit.component';
import { TranslatePipe } from '../../../i18n/translate.pipe';
import { ReusableTableComponent } from '../../../shared/components/reusable-table/reusable-table.component';
import { GlobalSearchComponent } from '../../../shared/components/global-search/global-search.component';

@Component({
  selector: 'app-farm-list',
  standalone: true,
  imports: [ReusableTableComponent, FarmAddEditComponent, TranslatePipe, GlobalSearchComponent],
  templateUrl: './farm-list.component.html',
  styleUrl: './farm-list.component.css'
})
export class FarmListComponent {

// Table Config
  columns: string[] = [];
  columnFields: string[] = [];

  // Data & Pagination
  farms: FarmList[] = [];
  totalRecords = 0;
  pageSize = 5;
  pageIndex = 0;
  searchValue = '';
  filterStatus: number | null = 2;

  private subs: Subscription[] = [];
  private langSub: Subscription | undefined;

  constructor(
    private translate: TranslateService,
    private farmsService: FarmService,
    private toast: ToastService,
    private confirm: ConfirmDialogService,
  ) {
    this.setColumns();
    this.langSub = this.translate.lang$.subscribe(() => this.setColumns());
  }

  ngOnInit(): void {
    this.loadUsers(1, this.pageSize);
    const sub = this.farmsService.farmsChanged$.subscribe(() => {
      this.loadUsers(this.pageIndex + 1, this.pageSize);
    });
    this.subs.push(sub);
  }

  private loadUsers(pageNo: number, recordPerPage: number): void {
     this.farms = [];

    const payload: any = {
      pageNo,
      recordPerPage,
      searchValue: this.searchValue || '',
      status: this.filterStatus
    };

    const sub = this.farmsService.getFarmsDetails(payload)
      .pipe()
      .subscribe({
        next: (res) => {
          this.farms = res?.data ?? [];
          this.totalRecords = res?.totalRecords ?? 0;
        },
        error: () => this.farms = []
      });

    this.subs.push(sub);
  }


  onSearch(value: string): void {
    this.searchValue = value;
    this.pageIndex = 0;
    this.loadUsers(1, this.pageSize);
  }


  onStatusChange(status: number | null): void {
    this.filterStatus = status === null ? 2 : status;
    this.pageIndex = 0;
    this.farms = [];
    this.loadUsers(1, this.pageSize);
  }




  onPageChange(event: { pageIndex: number; pageSize: number }): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadUsers(this.pageIndex + 1, this.pageSize);
  }


  clearFilters(): void {
    this.searchValue = '';
    this.filterStatus = 2;
    this.pageIndex = 0;
    this.farms = [];
    this.loadUsers(1, this.pageSize);
  }


 onToggleActive(event: { row: any; isActive: boolean }): void {
  event.row.isToggling = true;

  if (!event?.row?.userId) {
    this.toast.error(this.translate.instant('users.invalidId') ?? "");
    return;
  }

  const sub = this.farmsService.activeInActive(event.row.FarmIdId).subscribe({
    next: (res) => {
      if (res.isSuccess) {
        this.toast.success(res.message);

        const index = this.farms.findIndex(u => u === event.row.farmId);
        if (index !== -1) {
          this.farms[index].isActive = !this.farms[index].isActive;
        }
      } else {
        this.toast.error(res.message);
      }
    },
    error: (err) => {
      this.toast.error(err?.error?.message);
    },
    complete: () => {
      event.row.isToggling = false;  
    }
  });

  this.subs.push(sub);
}







  onDelete(row: any): void {
    const id = row?.userId;
    if (!id) {
      this.toast.error(this.translate.instant('users.invalidId')??"");
      return;
    }

    this.confirm.confirm(this.translate.instant('users.confirmDelete')??"").subscribe((confirmed) => {
      if (!confirmed) return;

      const sub = this.farmsService.deleteFarms(id).subscribe({
        next: (res) => {
          res.isSuccess ? this.toast.success(res.message) : this.toast.error(res.message);
          this.farmsService.notifyfarmsChanged();
        },
        error: (err) => {
          this.toast.error(err?.error?.message);
        }
      });

      this.subs.push(sub);
    });
  }

  private setColumns(): void {
    this.columns = [
      this.translate.instant('users.columns.firstName')??"",
      this.translate.instant('users.columns.lastName')??"",
      this.translate.instant('users.columns.email')??"",
      this.translate.instant('users.columns.phone')??"",
      this.translate.instant('users.columns.role')??"",
      this.translate.instant('users.columns.status')??""
    ];
    this.columnFields = ['firstName', 'lastName', 'email', 'phone', 'roleName', 'isActive'];
  }

  ngOnDestroy(): void {
    this.langSub?.unsubscribe();
    this.subs.forEach((s) => s.unsubscribe());
  }

}
