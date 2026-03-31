import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { ToastService } from '../../../../shared/services/toast.service';
import { ConfirmDialogService } from '../../../../shared/services/confirm-dialog.service';
import { TemplatePlaceholderMappingList } from '../../../../core/models/template-builder/template-placeholder-mapping-list';
import { ApiResponse } from '../../../../core/models/api-response';
import { SharedModule } from '../../../../shared/shared.module';
import { ReusableTableComponent } from '../../../../shared/components/reusable-table/reusable-table.component';
import { GlobalSearchComponent } from '../../../../shared/components/global-search/global-search.component';
import { TranslatePipe } from '../../../../i18n/translate.pipe';
import { PlaceholderMappingAddEditComponent } from '../placeholder-mapping-add-edit/placeholder-mapping-add-edit.component';
import { PlaceholderMappingService } from '../../../../core/services/template-builder/manage-placeholder-mapping/placeholder-mapping.service';
import { TranslateService } from '../../../../i18n/translate.service';
import { CommonService } from '../../../../shared/services/common.service';
import { PERMISSIONS } from '../../../../core/constants/permissions.constants';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-placeholder-mapping-list',
  standalone: true,
  imports: [
    SharedModule,
    CommonModule,
    ReusableTableComponent,
    GlobalSearchComponent,
    TranslatePipe,
    PlaceholderMappingAddEditComponent
  ],
  templateUrl: './placeholder-mapping-list.component.html',
  styleUrl: './placeholder-mapping-list.component.css'
})
export class PlaceholderMappingListComponent {

  columns: string[] = [];
  columnFields: string[] = [];

  mappings: TemplatePlaceholderMappingList[] = [];
  totalRecords = 0;
  pageSize = 10;
  pageIndex = 0;
  searchValue = '';
  filterStatus: number | null = 2;
  canAddMapping = false;
  viewPermission = PERMISSIONS.CategoryMappingView;
  editPermission = PERMISSIONS.CategoryMappingEdit;
  deletePermission = PERMISSIONS.CategoryMappingDelete;

  subs: Subscription[] = [];

  constructor(
    private toast: ToastService,
    private confirm: ConfirmDialogService,
    private mappingService: PlaceholderMappingService,
     private translate: TranslateService,
     private commonService: CommonService
  ) {
    this.setColumns();
  }

  ngOnInit(): void {
    this.canAddMapping = this.commonService.checkPermission(PERMISSIONS.CategoryMappingAdd, false);
    if (!this.commonService.checkPermission(PERMISSIONS.CategoryMappingView, false)) {
      return;
    }
    this.loadMappings(1, this.pageSize);

    this.subs.push(
      this.mappingService.placeholderMappingsChanged$.subscribe(() => {
        this.loadMappings(this.pageIndex + 1, this.pageSize);
      })
    );
  }

  loadMappings(pageNo: number, recordPerPage: number) {
    const payload = {
      pageNo,
      recordPerPage,
      searchValue: this.searchValue,
      status: this.filterStatus ?? 2
    };

    this.mappingService.getPlaceholderMappingDetails(payload).subscribe({
      
      next: (res: ApiResponse<TemplatePlaceholderMappingList[]>) => {
        this.mappings = (res.data ?? []).map(item => ({
          ...item,
          placeholdersDisplay: item.placeholders
             ?.map(p => p.placeholderValue)
        .join(', ')
        }));
        this.totalRecords = res.totalRecords ?? 0;
      },
      error: () => {
        this.mappings = [];
        this.totalRecords = 0;
      }
    });

  }

  onToggleActive(event: any) {
    if (!this.commonService.checkPermission(PERMISSIONS.CategoryMappingEdit)) {
      return;
    }
    const row = event.row;
    const prev = row.isActive;
    row.isToggling = true;

    this.mappingService.activeInActive(row.id).subscribe({
      next: res => {
        row.isActive = res.isSuccess ? !prev : prev;
        res.isSuccess ? this.toast.success(res.message) : this.toast.error(res.message);
      },
      complete: () => row.isToggling = false
    });
  }

  onDelete(row: TemplatePlaceholderMappingList) {
    if (!this.commonService.checkPermission(PERMISSIONS.CategoryMappingDelete)) {
      return;
    }
    
    this.confirm.confirm('Are you sure you want to delete this mapping?')
      .subscribe(ok => {
        if (!ok) return;

        this.mappingService.deletePlaceholderMapping(row.id).subscribe(res => {
          res.isSuccess ? this.toast.success(res.message) : this.toast.error(res.message);
        });
      });
  }

  private setColumns() {
    this.columns = [
     this.translate.instant('placeholderMapping.columns.category') as string,
    this.translate.instant('placeholderMapping.columns.placeholders') as string,
    ];

    this.columnFields = [
      'categoryName',
      'placeholdersDisplay',
    ];
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
  }
}
