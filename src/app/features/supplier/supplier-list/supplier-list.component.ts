import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { ReusableTableComponent } from '../../../shared/components/reusable-table/reusable-table.component';
import { SupplierAddEditComponent } from '../supplier-add-edit/supplier-add-edit.component';
import { GlobalSearchComponent } from '../../../shared/components/global-search/global-search.component';
import { Subscription } from 'rxjs';
import { SupplierService } from '../../../core/services/supplier/supplier.service';
import { ToastService } from '../../../shared/services/toast.service';
import { ConfirmDialogService } from '../../../shared/services/confirm-dialog.service';
import { CommonService } from '../../../shared/services/common.service';
import { PERMISSIONS } from '../../../core/constants/permissions.constants';
import { TranslateService } from '../../../i18n/translate.service';
import { TranslatePipe } from '../../../i18n/translate.pipe';

@Component({
  selector: 'app-supplier-list',
  standalone: true,
  imports: [
    CommonModule,
    ReusableTableComponent,
    SupplierAddEditComponent,
    GlobalSearchComponent,
    TranslatePipe
  ],
  templateUrl: './supplier-list.component.html',
  styleUrl: './supplier-list.component.css'
})
export class SupplierListComponent {

 @ViewChild('supplierModal') supplierModal!: SupplierAddEditComponent;



columns: string[] = [];
columnFields: string[] = [
  'supplierName',
  'supplierCode',
  'emailAddress',
  'phoneNumber',
  'city',
  'state',
  'isActive'
];

private setColumns(): void {
  this.columns = [
    this.translate.instant('supplier.columns.name'),
    this.translate.instant('supplier.columns.code'),
    this.translate.instant('supplier.columns.email'),
    this.translate.instant('supplier.columns.phone'),
    this.translate.instant('supplier.columns.city'),
    this.translate.instant('supplier.columns.state'),
    this.translate.instant('common.status')
  ];
}



  // Data & Pagination
  suppliers: any[] = [];
  totalRecords = 0;
  pageSize = 10;
  pageIndex = 0;
  searchValue = '';
  filterStatus: number | null = 2;
  canAddSupplier = false;
  viewPermission = PERMISSIONS.SuppliersView;
  editPermission = PERMISSIONS.SuppliersEdit;
  deletePermission = PERMISSIONS.SuppliersDelete;

  private subs: Subscription[] = [];

  constructor(
    private supplierService: SupplierService,
    private toast: ToastService,
    private confirm: ConfirmDialogService,
    private commonService: CommonService,
    private translate: TranslateService
  ) {
  this.setColumns();

  this.translate.lang$.subscribe(() => {
    this.setColumns();
  });
}

  ngOnInit(): void {
    this.canAddSupplier = this.commonService.checkPermission(PERMISSIONS.SuppliersAdd, false);
    if (!this.commonService.checkPermission(PERMISSIONS.SuppliersView, false))
      return;

    this.loadSuppliers(1, this.pageSize);

    const sub = this.supplierService.suppliersChanged$
      .subscribe(() => {
        this.loadSuppliers(this.pageIndex + 1, this.pageSize);
      });

    this.subs.push(sub);
  }

  private loadSuppliers(pageNo: number, recordPerPage: number): void {

    const payload = {
      pageNo,
      recordPerPage,
      searchValue: this.searchValue || '',
      status: this.filterStatus
    };

    const sub = this.supplierService.getSuppliers(payload)
      .subscribe({
        next: (res) => {
          this.suppliers = res?.data ?? [];
          this.totalRecords = res?.totalRecords ?? 0;
        },
        error: () => this.suppliers = []
      });

    this.subs.push(sub);
  }

  onSearch(value: string): void {
    this.searchValue = value;
    this.pageIndex = 0;
    this.loadSuppliers(1, this.pageSize);
  }

  onStatusChange(status: number | null): void {
    this.filterStatus = status === null ? 2 : status;
    this.pageIndex = 0;
    this.loadSuppliers(1, this.pageSize);
  }

  onPageChange(event: { pageIndex: number; pageSize: number }): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadSuppliers(this.pageIndex + 1, this.pageSize);
  }

  clearFilters(): void {
    this.searchValue = '';
    this.filterStatus = 2;
    this.pageIndex = 0;
    this.loadSuppliers(1, this.pageSize);
  }

  onToggleActive(event: { row: any; isActive: boolean }): void {
    if (!this.commonService.checkPermission(PERMISSIONS.SuppliersEdit)) {
      return;
    }

    if (!event?.row?.supplierId) {
      this.toast.error("Invalid Supplier Id");
      return;
    }

    const sub = this.supplierService.activeInActive(event.row.supplierId)
      .subscribe({
        next: (res) => {
          if (res.isSuccess) {
            this.toast.success(res.message);
            event.row.isActive = !event.row.isActive;
          } else {
            this.toast.error(res.message);
          }
        },
        error: (err) => this.toast.error(err?.error?.message)
      });

    this.subs.push(sub);
  }

  onDelete(row: any): void {
    if (!this.commonService.checkPermission(PERMISSIONS.SuppliersDelete))
      return;

    if (!row?.supplierId) {
      this.toast.error("Invalid Supplier Id");
      return;
    }

    this.confirm.confirm("Are you sure you want to delete this supplier?")
      .subscribe((confirmed) => {

        if (!confirmed) return;

        const sub = this.supplierService.deleteSupplier(row.supplierId)
          .subscribe({
            next: (res) => {
              if (res.isSuccess) {
                this.toast.success(res.message);
                this.supplierService.notifySuppliersChanged();
              } else {
                this.toast.error(res.message);
              }
            },
            error: (err) => this.toast.error(err?.error?.message)
          });

        this.subs.push(sub);
      });
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

}
