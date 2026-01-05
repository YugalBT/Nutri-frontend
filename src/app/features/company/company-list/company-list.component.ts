import { Component, OnDestroy, OnInit } from '@angular/core';
import { CompanyAddEditComponent } from '../company-add-edit/company-add-edit.component';
import { ReusableTableComponent } from '../../../shared/components/reusable-table/reusable-table.component';
import { TranslateService } from '../../../i18n/translate.service';
import { TranslatePipe } from '../../../i18n/translate.pipe';
import { CompanyService } from '../../../core/services/company/company.service';
import { CompanyList } from '../../../core/models/company-list';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { NgxSpinnerService } from 'ngx-spinner';
import { ApiResponse } from '../../../core/models/api-response';
import { GlobalSearchComponent } from '../../../shared/components/global-search/global-search.component';
import { ToastService } from '../../../shared/services/toast.service';
import { ConfirmDialogService } from '../../../shared/services/confirm-dialog.service';
import { CommonService } from '../../../shared/services/common.service';
import { PERMISSIONS } from '../../../core/constants/permissions.constants';

@Component({
  selector: 'app-company-list',
  standalone: true,
  imports: [
    CompanyAddEditComponent,
    ReusableTableComponent,
    TranslatePipe,
    GlobalSearchComponent  ,
  ],
  templateUrl: './company-list.component.html',
  styleUrls: ['./company-list.component.css']
})
export class CompanyListComponent implements OnInit, OnDestroy {

  columns: string[] = [];
  columnFields: string[] = [];
  companies: CompanyList[] = [];

  totalRecords = 0;
  pageSize = 10;
  pageIndex = 0;

  searchValue = '';
  filterStatus: number | null = null;

  private searchDebounce: any;
  private langSub: any;
  private subs: Subscription[] = [];
  toastr: any;

  constructor(
    private translate: TranslateService,
    private companyService: CompanyService,
    private spinner: NgxSpinnerService,
    private toast: ToastService,
    private confirm: ConfirmDialogService,
    private commonService : CommonService
  ) {
    this.setColumns();
    this.langSub = this.translate.lang$.subscribe(() => this.setColumns());
  }

  ngOnInit() {

  
    if(!this.commonService.checkPermission(PERMISSIONS.TenantView) || !this.commonService.checkPermission(PERMISSIONS.TenantDelete))
            return;
  this.loadCompanies(this.pageIndex, this.pageSize);

  this.companyService.companiesChanged$.subscribe(() => {
    this.reloadCompanies();
  });
}


  private setColumns() {
    this.columns = [
    this.translate.instant('company.columns.logo') || 'Logo',
   // this.translate.instant('company.columns.siteColor') || 'Site Color',
    this.translate.instant('company.columns.companyName') || 'Company Name',
    this.translate.instant('company.columns.firstName') || 'Name',
    this.translate.instant('company.columns.email') || 'Email',
    this.translate.instant('company.columns.phone') || 'Phone Number',
    this.translate.instant('company.columns.code') || 'Code',
    this.translate.instant('company.columns.status') || 'Status',
    //this.translate.instant('company.columns.actions') || 'Actions'
  ];

    this.columnFields = [
      'logo',
   // 'primaryColor',
      'companyName',
      'fullName',
      'userEmail',
      'userPhoneNumber',
      'code',
      'isActive'
    ];
  }

  private loadCompanies(pageNo: number, recordPerPage: number) {
    const payload = {
      searchValue: this.searchValue ?? '',
      pageNo,
      recordPerPage,
      status: this.filterStatus ?? 2,
      live: true,
      isMasterData: true
    };

    this.spinner.show();

    const sub = this.companyService.getAllCompaniesPaginated(payload)
      .pipe(finalize(() => this.spinner.hide()))
      .subscribe({
        next: (res: ApiResponse<any>) => {
          this.companies = (res.data ?? []).map((item: any) => ({
            ...item,
            fullName: `${item.firstName ?? ''} ${item.lastName ?? ''}`.trim()
          }));

          this.totalRecords = res.totalRecords
            ?? res.data?.totalRecords
            ?? this.companies.length;
        },
        error: () => {
          this.companies = [];
          this.totalRecords = 0;
        }
      });

    this.subs.push(sub);
  }


  onSearch(value: string) {   
    this.searchValue = value;

    if (this.searchDebounce) clearTimeout(this.searchDebounce);

    this.searchDebounce = setTimeout(() => {
      this.pageIndex = 0;
      this.loadCompanies(1, this.pageSize);
    }, 400);
  }

  onStatusChange(value: any) {
    this.filterStatus = (value === '' || value === null) ? null : Number(value);
    this.pageIndex = 0;
    this.loadCompanies(1, this.pageSize);
  }

  clearFilters() {
    this.searchValue = '';
    this.filterStatus = null;
    this.pageIndex = 0;
    this.loadCompanies(1, this.pageSize);
  }

  onPageChange(event: { pageIndex: number; pageSize: number }) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadCompanies(this.pageIndex + 1, this.pageSize);
  }

deleteCompany(row: any): void {
  if(!this.commonService.checkPermission(PERMISSIONS.TenantDelete))
    return;
  const id = row?.tenantId;
  if (!id) {
    this.toast.error("Invalid Company ID");
    return;
  }

  this.confirm.confirm(`Are you sure you want to delete "${row.companyName}"?`)
    .subscribe((confirmed) => {
      if (!confirmed) return;

      const sub = this.companyService.deleteCompany(id).subscribe({
        next: (res) => {
          if (res?.isSuccess) {
            this.toast.success(res.message || "Company deleted successfully");
          } else {
            this.toast.error(res.message || "Failed to delete company");
          }

          this.loadCompanies(1, this.pageSize);
        },

        error: (err) => {
          this.toast.error(err?.error?.message || "Something went wrong");
        }
      });

      this.subs.push(sub);
    });
}


  toggleCompanyStatus(event: any) {
    const row = event.row;
    const newStatus = event.isActive;

    this.companyService.ativeInactiveCompanyStatus(row.tenantId, newStatus).subscribe({
      next: () => {
        row.isActive = newStatus;
        this.toast.success('Status updated successfully');
         this.loadCompanies(this.pageIndex + 1, this.pageSize);
      },
      error: () => this.toast.error("Failed to update status")
    });
  }

  reloadCompanies() {
  this.loadCompanies(this.pageIndex + 1, this.pageSize);
}

  ngOnDestroy(): void {
    this.langSub.unsubscribe();
    this.subs.forEach(s => s.unsubscribe());
  }
}
