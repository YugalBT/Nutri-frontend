import { Component } from '@angular/core';
import { TemplateCategoryList } from '../../../../core/models/template-builder/template-category-list';
import { Subscription } from 'rxjs';
import { TranslateService } from '../../../../i18n/translate.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { ConfirmDialogService } from '../../../../shared/services/confirm-dialog.service';
import { CommonService } from '../../../../shared/services/common.service';
import { PERMISSIONS } from '../../../../core/constants/permissions.constants';
import { ManageCategoryService } from '../../../../core/services/template-builder/manage-category/manage-category.service';
import { ApiResponse } from '../../../../core/models/api-response';
import { SharedModule } from '../../../../shared/shared.module';
import { TemplateCategoryAddEditComponent } from '../template-category-add-edit/template-category-add-edit.component';
import { ReusableTableComponent } from '../../../../shared/components/reusable-table/reusable-table.component';
import { GlobalSearchComponent } from '../../../../shared/components/global-search/global-search.component';
import { TranslatePipe } from '../../../../i18n/translate.pipe';

@Component({
  selector: 'app-template-category-list',
  standalone: true,
  imports: [SharedModule, TemplateCategoryAddEditComponent, ReusableTableComponent, GlobalSearchComponent, TranslatePipe],
  templateUrl: './template-category-list.component.html',
  styleUrl: './template-category-list.component.css'
})
export class TemplateCategoryListComponent {
  columns: string[] = [];
  columnFields: string[] = [];

  days: TemplateCategoryList[] = [];
  totalRecords = 0;
  pageSize = 10;
  pageIndex = 0;
  searchValue = '';
  filterStatus: number | null = 2;

  subs: Subscription[] = [];
  langSub!: Subscription;


  constructor(
    private translate: TranslateService,
    private toast: ToastService,
    private confirm: ConfirmDialogService,
    private commonService: CommonService,
    private translateService: TranslateService,
    private templateService: ManageCategoryService
  ) {
    this.setColumns();
    this.langSub = this.translate.lang$.subscribe(() => this.setColumns());
  }

  ngOnInit(): void {
    // if(!this.commonService.checkPermission(PERMISSIONS.AnimalLactationView))

    //   return;

    this.loadTemplateCategory(1, this.pageSize);

    const sub = this.templateService.templateCategoriesChanged$.subscribe(() => {
      this.loadTemplateCategory(this.pageIndex + 1, this.pageSize);
    });
    this.subs.push(sub);
  }

  private loadTemplateCategory(pageNo: number, recordPerPage: number): void {
    const payload = {
      pageNo,
      recordPerPage,
      searchValue: this.searchValue ?? '',
      status: this.filterStatus
    };

    const sub = this.templateService.gettemplateCategoryDetails(payload).subscribe({
      next: (res: ApiResponse<TemplateCategoryList[]>) => {
        this.days = res?.data ?? [];
        this.totalRecords = res?.totalRecords ?? 0;
      },
      error: (error: any) => {
        this.days = [];
        this.totalRecords = 0;
      }
    });

    this.subs.push(sub);
  }

  onSearch(value: string): void {
    this.searchValue = value;
    this.pageIndex = 0;
    this.loadTemplateCategory(1, this.pageSize);
  }

  onStatusChange(status: number | null): void {
    this.filterStatus = status ?? 2;
    this.pageIndex = 0;
    this.loadTemplateCategory(1, this.pageSize);
  }

  clearFilters(): void {
    this.searchValue = '';
    this.filterStatus = 2;
    this.pageIndex = 0;
    this.loadTemplateCategory(1, this.pageSize);
  }

  onPageChange(event: { pageIndex: number; pageSize: number }): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadTemplateCategory(this.pageIndex + 1, this.pageSize);
  }

  onToggleActive(event: { row: any; isActive: boolean }): void {
    const row = event.row;
    const previousStatus = row.isActive;

    row.isToggling = true;

    const id = event?.row?.categoryId ?? event?.row?.categoryId;
    if (!id) {
      this.toast.error("Invalid id");
      row.isActive = previousStatus;
      row.isToggling = false;
      return;
    }

    const sub = this.templateService.activeInActive(id).subscribe({
      next: (res: any) => {
        if (res.isSuccess) {
          this.toast.success(res?.message);
          event.row.isActive = !event.row.isActive;
        } else {
          this.toast.error(res?.message);
          row.isActive = previousStatus;
        }
      },
      error: () => {
        this.toast.error('Failed to update status');
        row.isActive = previousStatus;
      },
      complete: () => event.row.isToggling = false
    });

    this.subs.push(sub);
  }

  onDelete(row: any): void {
    const id = row?.categoryId ?? row?.categoryId;
    if (!id) {
      this.toast.error("Invalid id");
      return;
    }

    this.confirm.confirm("Are you sure you want to delete this record?").subscribe((confirmed) => {
      if (!confirmed) return;

      const sub = this.templateService.deleteTemplateCategory(id).subscribe({
        next: (res: any) => {
          res.isSuccess ? this.toast.success(res.message) : this.toast.error(res.message);
          this.templateService.templateCategoriesChanged();
        },
        error: (err) => this.toast.error(err?.message)
      });

      this.subs.push(sub);
    });
  }

  private setColumns(): void {
    this.columns = [
      this.translateService.instant('templateCategory.columns.category') ?? 'Category Name',
      this.translateService.instant('templateCategory.columns.displayName') ?? 'Display Name',
      this.translateService.instant('common.status') ?? 'Status'
    ];

    this.columnFields = [
      'category',
      'displayName',
      'isActive'
    ];
  }

  ngOnDestroy(): void {
    this.langSub?.unsubscribe();
    this.subs.forEach(s => s.unsubscribe());
  }
}
