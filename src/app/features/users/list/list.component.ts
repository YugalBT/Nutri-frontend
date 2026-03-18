import { Component, OnDestroy, OnInit } from '@angular/core';
import { ReusableTableComponent } from '../../../shared/components/reusable-table/reusable-table.component';
import { AddeditComponent } from '../addedit/addedit.component';
import { GlobalSearchComponent } from '../../../shared/components/global-search/global-search.component';
import { TranslateService } from '../../../i18n/translate.service';
import { TranslatePipe } from '../../../i18n/translate.pipe';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { ToastService } from '../../../shared/services/toast.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ConfirmDialogService } from '../../../shared/services/confirm-dialog.service';
import { UserList } from '../../../core/models/userlist';
import { UsersService } from '../../../core/services/users/user.service';
import { PaginationRequest } from '../../../shared/modal/pagination-request.model';
import { CommonService } from '../../../shared/services/common.service';
import { PERMISSIONS } from '../../../core/constants/permissions.constants';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [ReusableTableComponent, AddeditComponent, TranslatePipe, GlobalSearchComponent],
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent implements OnInit, OnDestroy {

  // Table Config
  columns: string[] = [];
  columnFields: string[] = [];

  // Data & Pagination
  users: UserList[] = [];
  totalRecords = 0;
  pageSize = 10;
  pageIndex = 0;
  searchValue = '';
  filterStatus: number | null = 2;

  private subs: Subscription[] = [];
  private langSub: Subscription | undefined;

  constructor(
    private translate: TranslateService,
    private usersService: UsersService,
    private toast: ToastService,
    private confirm: ConfirmDialogService,
    private spinner: NgxSpinnerService,
    private commonService : CommonService
  ) {
    this.setColumns();
    this.langSub = this.translate.lang$.subscribe(() => this.setColumns());
  }

  // 🔹 Load Users Initially
  ngOnInit(): void {

    if(!this.commonService.checkPermission(PERMISSIONS.UserView)
      || !this.commonService.checkPermission(PERMISSIONS.UserDelete))
        return;
    this.loadUsers(1, this.pageSize);
    const sub = this.usersService.usersChanged$.subscribe(() => {
      this.loadUsers(this.pageIndex + 1, this.pageSize);
    });
    this.subs.push(sub);
  }

  private loadUsers(pageNo: number, recordPerPage: number): void {
    //this.users = [];
    this.spinner.show();

    const payload: any = {
      pageNo,
      recordPerPage,
      searchValue: this.searchValue || '',
      status: this.filterStatus
    };

    const sub = this.usersService.getUsers(payload)
      .subscribe({
        next: (res) => {
          this.users = res?.data ?? [];
          this.totalRecords = res?.totalRecords ?? 0;
        },
        error: () => this.users = []
      });

    this.subs.push(sub);
  }


  onSearch(value: string): void {
    this.searchValue = value;
    this.pageIndex = 0;
    this.loadUsers(1, this.pageSize);
  }


  onStatusChange(status: number | null): void {
    // Convert null (All) to 2 to match API expectation
    this.filterStatus = status === null ? 2 : status;
    this.pageIndex = 0;
    this.users = [];
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
    this.users = [];
    this.loadUsers(1, this.pageSize);
  }


  onToggleActive(event: { row: any; isActive: boolean }): void {
    event.row.isToggling = true;

    if (!event?.row?.userId) {
      this.toast.error(this.translate.instant('users.invalidId') ?? "");
      return;
    }

    const sub = this.usersService.activeInActive(event.row.userId).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.toast.success(res.message);

          const index = this.users.findIndex(u => u.userId === event.row.userId);
          if (index !== -1) {
            this.users[index].isActive = !this.users[index].isActive;
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
    if(!this.commonService.checkPermission(PERMISSIONS.UserView)
      || !this.commonService.checkPermission(PERMISSIONS.UserDelete))
        return;
    const id = row?.userId;
    if (!id) {
      this.toast.error(this.translate.instant('users.invalidId') ?? "");
      return;
    }

    this.confirm.confirm(this.translate.instant('users.confirmDelete') ?? "").subscribe((confirmed) => {
      if (!confirmed) return;

      const sub = this.usersService.deleteUser(id).subscribe({
        next: (res) => {
          res.isSuccess ? this.toast.success(res.message) : this.toast.error(res.message);
          this.usersService.notifyUsersChanged();
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
      this.translate.instant('users.columns.firstName') ?? "",
      this.translate.instant('users.columns.lastName') ?? "",
      this.translate.instant('users.columns.email') ?? "",
      this.translate.instant('users.columns.phone') ?? "",
      this.translate.instant('users.columns.role') ?? "",
      this.translate.instant('users.columns.status') ?? ""
    ];
    this.columnFields = ['firstName', 'lastName', 'email', 'phone', 'roleName', 'isActive'];
  }

  ngOnDestroy(): void {
    this.langSub?.unsubscribe();
    this.subs.forEach((s) => s.unsubscribe());
  }

}
