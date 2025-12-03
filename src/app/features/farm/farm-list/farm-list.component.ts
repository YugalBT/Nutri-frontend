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
  styleUrls: ['./farm-list.component.css']
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
    private farmService: FarmService,
    private toast: ToastService,
    private confirm: ConfirmDialogService
  ) {
    this.setColumns();
    this.langSub = this.translate.lang$.subscribe(() => this.setColumns());
  }

  ngOnInit(): void {
    this.loadFarms(1, this.pageSize);
    const sub = this.farmService.farmsChanged$.subscribe(() => {
      this.loadFarms(this.pageIndex + 1, this.pageSize);
    });
    this.subs.push(sub);
  }

  private loadFarms(pageNo: number, recordPerPage: number): void {
    const payload: any = {
      pageNo,
      recordPerPage,
      searchValue: this.searchValue || '',
      status: this.filterStatus
    };

    const sub = this.farmService.getFarmsDetails(payload)
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
    this.loadFarms(1, this.pageSize);
  }

  onStatusChange(status: number | null): void {
    this.filterStatus = status === null ? 2 : status;
    this.pageIndex = 0;
    this.farms = [];
    this.loadFarms(1, this.pageSize);
  }

  onPageChange(event: { pageIndex: number; pageSize: number }): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadFarms(this.pageIndex + 1, this.pageSize);
  }

  clearFilters(): void {
    this.searchValue = '';
    this.filterStatus = 2;
    this.pageIndex = 0;
    this.farms = [];
    this.loadFarms(1, this.pageSize);
  }

  onToggleActive(event: { row: any; isActive: boolean }): void {
    event.row.isToggling = true;

    if (!event?.row?.farmId) {
      this.toast.error(this.translate.instant('farms.invalidId') ?? "");
      return;
    }

    const sub = this.farmService.activeInActive(event.row.farmId).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.toast.success(res.message);
          event.row.isActive = !event.row.isActive;
        } else {
          this.toast.error(res.message);
        }
      },
      error: (err) => this.toast.error(err?.error?.message),
      complete: () => event.row.isToggling = false
    });

    this.subs.push(sub);
  }

  onDelete(row: any): void {
    const id = row?.farmId;
    if (!id) {
      this.toast.error(this.translate.instant('farms.invalidId') ?? "");
      return;
    }

    this.confirm.confirm(this.translate.instant('farms.confirmDelete') ?? "").subscribe((confirmed) => {
      if (!confirmed) return;

      const sub = this.farmService.deleteFarms(id).subscribe({
        next: (res) => {
          res.isSuccess ? this.toast.success(res.message) : this.toast.error(res.message);
          this.farmService.notifyfarmsChanged();
        },
        error: (err) => this.toast.error(err?.error?.message)
      });

      this.subs.push(sub);
    });
  }

  private setColumns(): void {
    this.columns = [
      this.translate.instant('farms.columns.farmName') ?? "",
      this.translate.instant('farms.columns.town') ?? "",
      this.translate.instant('farms.columns.country') ?? "",
      this.translate.instant('farms.columns.status') ?? ""
    ];
    this.columnFields = ['farmName', 'town', 'country', 'isActive'];
  }

  ngOnDestroy(): void {
    this.langSub?.unsubscribe();
    this.subs.forEach((s) => s.unsubscribe());
  }
  

}
