import { Component, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectUserRoles } from '../../../state/auth/auth.selectors';
import { PERMISSIONS } from '../../../core/constants/permissions.constants';
import { RationList } from '../../../core/models/ration-list';
import { Subscription } from 'rxjs';
import { TranslateService } from '../../../i18n/translate.service';
import { RationService } from '../../../core/services/ration/ration.service';
import { ToastService } from '../../../shared/services/toast.service';
import { ConfirmDialogService } from '../../../shared/services/confirm-dialog.service';
import { ApiResponse } from '../../../core/models/api-response';
import { RationAddEditComponent } from "../ration-add-edit/ration-add-edit.component";
import { GlobalSearchComponent } from '../../../shared/components/global-search/global-search.component';
import { ReusableTableComponent } from '../../../shared/components/reusable-table/reusable-table.component';
import { CommonService } from '../../../shared/services/common.service';
import { Router } from '@angular/router';
import { ROUTE_CONST } from '../../../core/constants/route.constants';
import { TranslatePipe } from '../../../i18n/translate.pipe';

@Component({
  selector: 'app-ration-list',
  standalone: true,
  imports: [RationAddEditComponent, GlobalSearchComponent, ReusableTableComponent, TranslatePipe],
  templateUrl: './ration-list.component.html',
  styleUrls: ['./ration-list.component.css']
})
export class RationListComponent {

  columns: string[] = [];
  columnFields: string[] = [];
  ration: RationList[] = [];

  totalRecords = 0;
  pageSize = 10;
  pageIndex = 0;
  searchValue = '';
  filterStatus: number | null = 2;

  private subs: Subscription[] = [];
  private langSub: Subscription | undefined;
  // permissions
  userRoles: string[] = [];
  canAddRation = false;
  
  // Permission properties for table
  viewPermission = PERMISSIONS.RationView;
  editPermission = PERMISSIONS.RationEdit;
  deletePermission = PERMISSIONS.RationDelete;
  
  @ViewChild(RationAddEditComponent) rationModalRef!: RationAddEditComponent;



  constructor(
    private translate: TranslateService,
    private rationService: RationService,
    private toast: ToastService,
    private confirm: ConfirmDialogService,
    private store: Store,
    private commonService : CommonService,
    private router: Router
  ) {
    this.setColumns();
    this.langSub = this.translate.lang$.subscribe(() => this.setColumns());
  }

  ngOnInit(): void {
    
    if(!this.commonService.checkPermission(PERMISSIONS.RationAdd)
      || !this.commonService.checkPermission(PERMISSIONS.RationView))
        return;
    this.loadUserPermissions();
    this.loadRation(1, this.pageSize);
    const sub = this.rationService.rationChanged$.subscribe(() => {
      this.loadRation(this.pageIndex + 1, this.pageSize);
    });
    this.subs.push(sub);
  }

  private loadUserPermissions(): void {
    const sub = this.store.select(selectUserRoles).subscribe(roles => {
      this.userRoles = roles || [];
      this.canAddRation = this.userRoles.includes(PERMISSIONS.RationAdd);
    });
    this.subs.push(sub);
  }

  private loadRation(pageNo: number, recordPerPage: number): void {
    const payload: any = {
      pageNo,
      recordPerPage,
      searchValue: this.searchValue || '',
      status: this.filterStatus
    };

    const sub = this.rationService.getrationDetails(payload)
      .subscribe({
        next: (res: ApiResponse<any>) => {
          this.ration = res?.data ?? [];
          this.totalRecords = res?.totalRecords ?? 0;
        },
        error: () => this.ration = []
      });

    this.subs.push(sub);
  }

  onSearch(value: string): void {
    this.searchValue = value;
    this.pageIndex = 0;
    this.loadRation(1, this.pageSize);
  }

  onStatusChange(status: number | null): void {
    this.filterStatus = status === null ? 2 : status;
    this.pageIndex = 0;
    this.ration = [];
    this.loadRation(1, this.pageSize);
  }

  onPageChange(event: { pageIndex: number; pageSize: number }): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadRation(this.pageIndex + 1, this.pageSize);
  }

  clearFilters(): void {
    this.searchValue = '';
    this.filterStatus = 2;
    this.pageIndex = 0;
    this.ration = [];
    this.loadRation(1, this.pageSize);
  }

  onToggleActive(event: { row: any; isActive: boolean }): void {
    event.row.isToggling = true;

    if (!event?.row?.rationId) {
      this.toast.error(this.translate.instant('ration.invalidId') ?? "");
      return;
    }

    const sub = this.rationService.activeInActive(event.row.rationId).subscribe({
      next: (res: ApiResponse<any>) => {
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
    
    if(!this.commonService.checkPermission(PERMISSIONS.RationDelete))
        return;
    const id = row?.rationId;
    if (!id) {
      this.toast.error(this.translate.instant('ration.invalidId') ?? "");
      return;
    }

    this.confirm.confirm(this.translate.instant('ration.confirmDelete') ?? "")
      .subscribe((confirmed) => {
        if (!confirmed) return;

        const sub = this.rationService.deleteration(id).subscribe({
          next: (res: ApiResponse<any>) => {
            res.isSuccess ? this.toast.success(res.message) : this.toast.error(res.message);
            this.rationService.notifyrationChanged();
          },
          error: (err) => this.toast.error(err?.error?.message)
        });

        this.subs.push(sub);
      });
  }
  onCellClick(event: { field: string; row: any }): void {
  if (event.field !== 'rationName') return;

  this.router.navigate([ROUTE_CONST.RATION_ITEMS], {
    queryParams: {
      rationId: event.row.rationId,
      returnTab: 'ration'
    }
  });
}



  private setColumns(): void {
      this.columns = [
    this.translate.instant('ration.columns.rationName') ?? '',
   // this.translate.instant('ration.columns.farmName') ?? '',
    this.translate.instant('ration.columns.totalRationItems') ?? '',
    this.translate.instant('ration.columns.animalGroup') ?? '',
    this.translate.instant('common.status') ?? ''
    ];
    this.columnFields = ['rationName',  'totalItems','animalGroupNameEn', 'isActive'];
  }

  ngOnDestroy(): void {
    this.langSub?.unsubscribe();
    this.subs.forEach((s) => s.unsubscribe());
  }

  openAddRationModal(): void {
    this.rationModalRef.openModal(false);
  }


}
