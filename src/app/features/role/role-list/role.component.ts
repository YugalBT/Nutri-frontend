import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { ReusableTableComponent } from '../../../shared/components/reusable-table/reusable-table.component';
import { TranslatePipe } from '../../../i18n/translate.pipe';
import { HasPermissionDirective } from '../../../shared/has-permission.directive';
import { UserRoleAddEditComponent } from '../role-add-edit/role-add-edit.component';
import { AddEditRoleService } from '../../../core/services/role/add-edit-role.service';
import { RoleItem } from '../../../core/models/add-edit-role';
import { TranslateService } from '../../../i18n/translate.service';
import { ToastService } from '../../../shared/services/toast.service';
import { ConfirmDialogService } from '../../../shared/services/confirm-dialog.service';
import { selectCanManageRoles, selectCanDeleteRoles } from '../../../state/auth/auth.selectors';
import { NgxSpinnerService } from 'ngx-spinner';
import { GlobalSearchComponent } from '../../../shared/components/global-search/global-search.component';


@Component({
  selector: 'app-role',
  standalone: true,
  imports: [ReusableTableComponent, CommonModule, TranslatePipe, HasPermissionDirective, UserRoleAddEditComponent, GlobalSearchComponent],
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.css']
})
export class RoleComponent implements OnInit, OnDestroy {
  @ViewChild(UserRoleAddEditComponent) roleAddEditComp!: UserRoleAddEditComponent;
  roles: RoleItem[] = [];
  columns: string[] = [];
  columnFields: string[] = [];
  searchValue = '';
  filterStatus: number | null = null;
  totalRecords = 0;
  pageSize = 5;
  pageIndex = 0;
  canManageRoles = false;
  canDeleteRoles = false;
  private subs: Subscription[] = [];
  private langSub: any;
  private childSubs: any[] = [];

  constructor(
    private store: Store,
    private translate: TranslateService,
    private toast: ToastService,
    private confirm: ConfirmDialogService,
    private spinner: NgxSpinnerService,
    private roleService: AddEditRoleService
  ) {
    this.setColumns();
    this.langSub = this.translate.lang$.subscribe(() => this.setColumns());
  }

  ngOnInit(): void {
    this.store.select(selectCanManageRoles).pipe(take(1)).subscribe((canManage) => {
      this.canManageRoles = canManage;
      if (!canManage) {
        this.toast.error(this.translate.instant('common.noPermission') || 'No permission to manage roles');
      }
    });

    this.store.select(selectCanDeleteRoles).pipe(take(1)).subscribe((canDelete) => {
      this.canDeleteRoles = canDelete;
    });

    this.loadRoles();
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
      status: 2,
      searchValue: ''
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
    if (!this.canManageRoles) {
      this.toast.error(this.translate.instant('common.noPermission') || 'No permission');
      return;
    }
    if (this.roleAddEditComp) {
      this.roleAddEditComp.openModal(false);
    }
  }

  onEditRole(row: RoleItem): void {
    if (!this.canManageRoles) {
      this.toast.error(this.translate.instant('common.noPermission') || 'No permission');
      return;
    }
    if (this.roleAddEditComp) {
      this.roleAddEditComp.openModal(true, row);
    }
  }

  onDeleteRole(row: RoleItem): void {
    if (!this.canDeleteRoles) {
      this.toast.error(this.translate.instant('common.noPermission') || 'No permission');
      return;
    }

    this.confirm.confirm(
      this.translate.instant('common.confirmDelete') || `Delete role "${row.nameEn}"?`
    ).subscribe((result) => {
      if (result) {

        const sub = this.roleService.deleteRole(row.roleId).subscribe({
          next: () => {
            this.toast.success(this.translate.instant('common.deleted') || 'Role deleted');
            this.loadRoles();
          },
          error: () => {
            this.toast.error(this.translate.instant('common.error') || 'Delete failed');
          }
        });
        this.subs.push(sub);
      }
    });
  }

   onSearch(value: string) {    // 🔥 FIX 2: Strict string input
    this.searchValue = value;

    // if (this.searchDebounce) clearTimeout(this.searchDebounce);

    // this.searchDebounce = setTimeout(() => {
    //   this.pageIndex = 0;
    //  // this.loadCompanies(1, this.pageSize);
    // }, 400);
  }
 clearFilters() {
    this.searchValue = '';
    this.filterStatus = null;
    this.pageIndex = 0;
    //this.loadCompanies(1, this.pageSize);
  }
  onPageChange(event: { pageIndex: number; pageSize: number }): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadRoles();
  }

  ngOnDestroy(): void {
    if (this.langSub) this.langSub.unsubscribe();
    this.subs.forEach(s => s.unsubscribe());
    this.childSubs.forEach(s => s.unsubscribe && s.unsubscribe());
  }
}