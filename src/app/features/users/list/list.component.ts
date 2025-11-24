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
import { UsersService } from '../../../core/services/users/user.service';
import { UserList } from '../../../core/models/userlist';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [ReusableTableComponent, AddeditComponent, TranslatePipe, GlobalSearchComponent],
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})

export class ListComponent implements OnDestroy {
  columns: string[] = [];
  columnFields: string[] = [];
  private langSub: any;
  users: UserList[] = [];
  totalRecords = 0;
  pageSize = 5;
  pageIndex = 0;
  searchValue = '';
  private searchDebounce: any;
  filterStatus: number | null = null;
  private subs: Subscription[] = [];


  constructor(private translate: TranslateService, private usersService: UsersService, private toast: ToastService,
    private confirm: ConfirmDialogService, private spinner: NgxSpinnerService) {
    this.setColumns();
    this.langSub = this.translate.lang$.subscribe(() => this.setColumns());
  }

  onToggleActive(event: { row: any; isActive: boolean }) {
    if (!event || !event.row) return;
    const id = event.row.userId ?? null;
    if (!id) {
      this.toast.error(this.translate.instant('users.invalidId') || 'Invalid user id');
      return;
    }

    const sub = this.usersService.activeInActive(id).subscribe({
      next: (res) => {
        this.toast.success(res.message);
        this.usersService.notifyUsersChanged();
      },
      error: (err) => {
        this.toast.error(err?.error?.message);
      }
    });
    this.subs.push(sub);
  }

  onDelete(row: any) {
    if (!row) return;
    const id = row.userId ?? null;
    if (!id) {
      this.toast.error(this.translate.instant('users.invalidId') || 'Invalid user id');
      return;
    }

    this.confirm.confirm(this.translate.instant('users.confirmDelete') || 'Do you want to delete this user?').subscribe(result => {
      if (!result) return;

      const sub = this.usersService.deleteUser(id).subscribe({
        next: (res) => {
          if(res.isSuccess){
          this.toast.success(res.message);
          this.usersService.notifyUsersChanged();
          }else{
            this.toast.error(res.message);
            
          }
          
        },
        error: (err) => {
          this.toast.error(err?.error?.message);
        }
      });
      this.subs.push(sub);
    });
  }

  ngOnInit(): void {
    this.loadUsers(1, this.pageSize);
    const sub = this.usersService.usersChanged$.subscribe(() => {

      this.loadUsers(this.pageIndex + 1, this.pageSize);
    });
    this.subs.push(sub);
  }

  private loadUsers(pageNo: number, recordPerPage: number) {
    const payload = {
      tenantId: '',
      searchValue: this.searchValue ?? '',
      pageNo,
      recordPerPage,
      status: this.filterStatus ?? 2,
      live: true,
      isMasterData: true
    };

    this.spinner.show();
    const sub = this.usersService.getUsers(payload)
      .pipe(finalize(() => this.spinner.hide()))
      .subscribe({
        next: (res) => {
          this.users = res?.data ?? [];
          this.totalRecords = res?.totalRecords ?? (Array.isArray(res.data) ? res?.data?.length : 0);
        },
        error: (err) => {
          this.users = [];
          this.totalRecords = 0;
        }
      });
    this.subs.push(sub);
  }

  onSearch(value: string) {
    // debounce and reload list
    this.searchValue = value ?? '';
    if (this.searchDebounce) {
      clearTimeout(this.searchDebounce);
    }
    this.searchDebounce = setTimeout(() => {
      this.pageIndex = 0;
      this.loadUsers(1, this.pageSize);
    }, 400);
  }

  onStatusChange(value: any) {

    if (value === null || value === 'null' || value === '') {
      this.filterStatus = null;
    } else {
      this.filterStatus = Number(value);
    }
    this.pageIndex = 0;
    this.loadUsers(1, this.pageSize);
  }

  clearFilters() {
    this.searchValue = '';
    this.filterStatus = null;
    this.pageIndex = 0;
    this.loadUsers(1, this.pageSize);
  }

  onPageChange(event: { pageIndex: number; pageSize: number }) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadUsers(this.pageIndex + 1, this.pageSize);
  }

  private setColumns() {
    this.columns = [
      this.translate.instant('users.columns.firstName') || 'First Name',
      this.translate.instant('users.columns.lastName') || 'Last Name',
      this.translate.instant('users.columns.email') || 'Email',
      this.translate.instant('users.columns.phone') || 'Phone Number',
      this.translate.instant('users.columns.role') || 'Role Name',
      this.translate.instant('users.columns.status') || 'Status'
    ];

    this.columnFields = ['firstName', 'lastName', 'email', 'phone', 'roleName', 'isActive'];
  }

  ngOnDestroy(): void {
    this.langSub.unsubscribe();
    this.subs.forEach(s => s.unsubscribe());
  }

}
