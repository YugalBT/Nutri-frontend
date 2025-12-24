import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { TranslateService } from '../../../../i18n/translate.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { ConfirmDialogService } from '../../../../shared/services/confirm-dialog.service';
import { ManagePlaceholderService } from '../../../../core/services/template-builder/manage-placeholder/manage-placeholder.service';
import { TemplatePlaceholderList } from '../../../../core/models/template-builder/template-placeholder-list';
import { ApiResponse } from '../../../../core/models/api-response';
import { SharedModule } from '../../../../shared/shared.module';
import { ReusableTableComponent } from '../../../../shared/components/reusable-table/reusable-table.component';
import { GlobalSearchComponent } from '../../../../shared/components/global-search/global-search.component';
import { TranslatePipe } from '../../../../i18n/translate.pipe';
import { TemplatePlaceholderAddEditComponent } from '../placeholder-add-edit/placeholder-add-edit.component';

@Component({
  selector: 'app-template-placeholder-list',
  standalone: true,
  imports: [
    SharedModule,
    ReusableTableComponent,
    GlobalSearchComponent,
    TranslatePipe,
    TemplatePlaceholderAddEditComponent
  ],
  templateUrl: './placeholder-list.component.html',
  styleUrl: './placeholder-list.component.css'
})
export class TemplatePlaceholderListComponent {

  columns: string[] = [];
  columnFields: string[] = [];

  placeholders: TemplatePlaceholderList[] = [];
  totalRecords = 0;
  pageSize = 10;
  pageIndex = 0;
  searchValue = '';
  filterStatus: number | null = 2;

  subs: Subscription[] = [];

  constructor(
    private translate: TranslateService,
    private toast: ToastService,
    private confirm: ConfirmDialogService,
    private placeholderService: ManagePlaceholderService
  ) {
    this.setColumns();
  }

  ngOnInit(): void {
    this.loadPlaceholders(1, this.pageSize);

    this.subs.push(
      this.placeholderService.placeholdersChanged$.subscribe(() => {
        this.loadPlaceholders(this.pageIndex + 1, this.pageSize);
      })
    );
  }

  loadPlaceholders(pageNo: number, recordPerPage: number): void {
    const payload = {
      pageNo,
      recordPerPage,
      searchValue: this.searchValue,
      status: this.filterStatus
    };

    this.placeholderService.getPlaceholderDetails(payload).subscribe({
      next: (res: ApiResponse<TemplatePlaceholderList[]>) => {
        this.placeholders = res?.data ?? [];
        this.totalRecords = res?.totalRecords ?? 0;
      },
      error: () => {
        this.placeholders = [];
        this.totalRecords = 0;
      }
    });
  }

  onSearch(value: string) {
    this.searchValue = value;
    this.pageIndex = 0;
    this.loadPlaceholders(1, this.pageSize);
  }

  onStatusChange(status: number | null) {
    this.filterStatus = status ?? 2;
    this.pageIndex = 0;
    this.loadPlaceholders(1, this.pageSize);
  }

  clearFilters() {
    this.searchValue = '';
    this.filterStatus = 2;
    this.pageIndex = 0;
    this.loadPlaceholders(1, this.pageSize);
  }

  onPageChange(event: any) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadPlaceholders(this.pageIndex + 1, this.pageSize);
  }

  onToggleActive(event: any) {
    const row = event.row;
    const previous = row.isActive;

    row.isToggling = true;

    this.placeholderService.activeInActive(row.id).subscribe({
      next: res => {
        res.isSuccess
          ? (row.isActive = !previous)
          : (row.isActive = previous);

        res.isSuccess
          ? this.toast.success(res.message)
          : this.toast.error(res.message);
      },
      error: () => row.isActive = previous,
      complete: () => row.isToggling = false
    });
  }

  onDelete(row: TemplatePlaceholderList) {
    this.confirm.confirm('Are you sure you want to delete this placeholder?')
      .subscribe(confirmed => {
        if (!confirmed) return;

        this.placeholderService.deletePlaceholder(row.id)
          .subscribe(res => {
            res.isSuccess
              ? this.toast.success(res.message)
              : this.toast.error(res.message);
          });
      });
  }

  private setColumns() {
    this.columns = [
      this.translate.instant('placeholder.columns.value') ?? 'Placeholder Value',
      this.translate.instant('common.status') ?? 'Status'
    ];

    this.columnFields = [
      'placeholderValue',
      'isActive'
    ];
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
  }
}
