import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { ReusableTableComponent } from '../../../shared/components/reusable-table/reusable-table.component';
import { TranslatePipe } from '../../../i18n/translate.pipe';
import { UserRoleAddEditComponent } from '../role-add-edit/role-add-edit.component';
import { AddEditRoleService } from '../../../core/services/role/add-edit-role.service';
import { RoleItem } from '../../../core/models/add-edit-role';
import { TranslateService } from '../../../i18n/translate.service';
import { ToastService } from '../../../shared/services/toast.service';
import { ConfirmDialogService } from '../../../shared/services/confirm-dialog.service';
// import { selectCanManageRoles, selectCanDeleteRoles } from '../../../state/auth/auth.selectors';
import { NgxSpinnerService } from 'ngx-spinner';
import { GlobalSearchComponent } from '../../../shared/components/global-search/global-search.component';
import { ApiResponse } from '../../../core/models/api-response';
import { PERMISSIONS } from '../../../core/constants/permissions.constants';
import { Constants } from '../../../shared/utils/constants/constants';
import { CommonService } from '../../../shared/services/common.service';



@Component({
  selector: 'app-role',
  standalone: true,
  imports: [ReusableTableComponent, CommonModule, TranslatePipe, UserRoleAddEditComponent, GlobalSearchComponent],
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.css']
})
export class RoleComponent implements OnInit, OnDestroy ,AfterViewInit{
  @ViewChild(UserRoleAddEditComponent) roleAddEditComp!: UserRoleAddEditComponent;
  roles: RoleItem[] = [];
  columns: string[] = [];
  columnFields: string[] = [];
  searchValue = '';
  statusFilter: number | null = null;
  totalRecords = 0;
  pageSize = 10;
  pageIndex = 0;
  isShow = false;
  
  canManageRoles = false;
  canDeleteRoles = false;
  private subs: Subscription[] = [];
  private langSub: Subscription | undefined;
  private childSubs: Subscription[] = []; 
  constructor(
    private store: Store,
    private translate: TranslateService,
    private toast: ToastService,
    private confirm: ConfirmDialogService,
    private spinner: NgxSpinnerService,
    private roleService: AddEditRoleService,
    private commonService : CommonService
  ) {
    this.setColumns();
    this.langSub = this.translate.lang$.subscribe(() => this.setColumns());
  }

  ngOnInit(): void {
    
    // this.store.select(selectCanManageRoles).pipe(take(1)).subscribe((canManage) => {
    //   this.canManageRoles = canManage;
    //   if (!canManage) {
    //     this.toast.error(this.translate.instant('common.noPermission') || 'No permission to manage roles');
    //   }
    // });

    // this.store.select(selectCanDeleteRoles).pipe(take(1)).subscribe((canDelete) => {
    //   this.canDeleteRoles = canDelete;
    // });

    if(!this.commonService.checkPermission(PERMISSIONS.RoleView)) return;
    this.loadRoles();
    
  }

   ngAfterViewInit(): void {
  if (this.roleAddEditComp) {
    const sub = this.roleAddEditComp.roleSaved.subscribe(() => {
      this.loadRoles();  
    });
    this.childSubs.push(sub);
  }
}


  private setColumns(): void {
    this.columns = [
      this.translate.instant('role.name') || 'Name',
      this.translate.instant('common.status') || 'Status'
    ];
    this.columnFields = ['nameEn',  'isActive'];
  }

  
  loadRoles(): void {
    this.spinner.show();
    const payload = {
      pageNo: this.pageIndex + 1,
      recordPerPage: this.pageSize,
      status: this.statusFilter ?? 2,
      searchValue: this.searchValue,
      isShow: this.isShow
    };

    const sub = this.roleService.getRoles(payload).subscribe({
      next: (res) => {
        const data = (res as any)?.data || (res as any)?.items || res || [];
        this.roles = Array.isArray(data) ? data as RoleItem[] : [];
        this.totalRecords = (res as any)?.totalRecords ?? (Array.isArray(this.roles) ? this.roles.length : 0);
        this.spinner.hide();
      },
      error: (err) => {
        this.spinner.hide();
        this.toast.error(this.translate.instant('common.error') || 'Error loading roles');
      }
    });
    this.subs.push(sub);
  }

  onAddRole(): void {
    if(!this.commonService.checkPermission(PERMISSIONS.RoleAdd)) return;
    
    if (this.roleAddEditComp) {
      this.roleAddEditComp.openModal(false);
    }
  }

  onEditRole(row: RoleItem): void {
    if(!this.commonService.checkPermission(PERMISSIONS.RoleEdit)) return;

    if (this.roleAddEditComp) {
      this.roleAddEditComp.openModal(true, row);
    }
  }

  onDeleteRole(row: RoleItem): void {
    if(!this.commonService.checkPermission(PERMISSIONS.RoleDelete)) return;

    this.confirm.confirm(
      this.translate.instant('common.confirmDelete') || `Delete role "${row.nameEn}"?`
    ).subscribe((result) => {
      if (result) {
        this.spinner.show();
        const sub = this.roleService.deleteRole(row.roleId).subscribe({
          next: (res: any) => {
            this.spinner.hide();
            if (res?.isSuccess || res?.isSuccess !== false) {
              this.toast.success(res?.message|| 'Role deleted successfully');
              this.loadRoles();
            } else {
              this.toast.error(res?.message || this.translate.instant('common.error') || 'Delete failed');
            }
          },
          error: (err: any) => {
            this.spinner.hide();
            const errMsg = err?.error?.message || err?.message || this.translate.instant('common.error') || 'Delete failed';
            this.toast.error(errMsg);
            console.error('Delete error:', err);
          }
        });
        this.subs.push(sub);
      }
    });
  }

  onSearch(value: string): void {
    this.searchValue = value;
    this.pageIndex = 0;
    this.loadRoles();
  }

  onIsShowChange(isShow: boolean): void {
    // Handle the isShow change event here
    console.log('Is Show changed to:', isShow);
    this.isShow = isShow;
    this.loadRoles();

    // You can implement any additional logic needed when isShow changes
  }
  onStatusChange(status: number | null): void {
    this.statusFilter = status;
    this.pageIndex = 0;
    this.loadRoles();
  }

  clearFilters(): void {
    this.searchValue = '';
    this.pageIndex = 0;
    this.loadRoles();
  }
  onPageChange(event: { pageIndex: number; pageSize: number }): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadRoles();
  }

 onToggleActive(event: { row: any; isActive: boolean }): void {
  if (!event?.row?.roleId) {
    this.toast.error(this.translate.instant('role.invalidId') ?? "");
    return;
  }

  if (event.row.isToggling) return; // prevent double toggle
  event.row.isToggling = true;

  const sub = this.roleService.activeInActive(event.row.roleId).subscribe({
    next: (res: ApiResponse<any>) => {
      if (res.isSuccess) {
        this.toast.success(res.message);
        const index = this.roles.findIndex(u => u.roleId === event.row.roleId);
        if (index !== -1) {
          this.roles[index].isActive = !this.roles[index].isActive;
        }
      } else {
        this.toast.error(res.message);
      }
    },
    error: (err) => {
      this.toast.error(err?.error?.message || 'Something went wrong');
    },
    complete: () => {
      event.row.isToggling = false; 
    }
  });

  this.subs.push(sub);
}




  ngOnDestroy(): void {
    if (this.langSub) this.langSub.unsubscribe();
    this.subs.forEach(s => s.unsubscribe());
    this.childSubs.forEach(s => s.unsubscribe && s.unsubscribe());
  }

   
}