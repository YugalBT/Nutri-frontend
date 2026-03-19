import { Component, ViewChild, OnDestroy, OnInit } from '@angular/core';
import { ReusableTableComponent } from '../../../shared/components/reusable-table/reusable-table.component';
import { ProductBuildAddEditComponent } from '../product-build-add-edit/product-build-add-edit.component';
import { GlobalSearchComponent } from '../../../shared/components/global-search/global-search.component';
import { Subscription } from 'rxjs';
import { ProductBuildService } from '../../../core/services/product-build-service/product-build-service';
import { ToastService } from '../../../shared/services/toast.service';
import { ConfirmDialogService } from '../../../shared/services/confirm-dialog.service';
import { TranslateService } from '../../../i18n/translate.service';
import { TranslatePipe } from '../../../i18n/translate.pipe';

@Component({
  selector: 'app-product-build-list',
  standalone: true,
  imports: [
    ReusableTableComponent,
    ProductBuildAddEditComponent,
    GlobalSearchComponent,
    TranslatePipe
  ],
  templateUrl: './product-build-list.component.html'
})
export class ProductBuildListComponent implements OnInit, OnDestroy {

  @ViewChild('modal') modal!: ProductBuildAddEditComponent;

  columns: string[] = [];
  columnFields: string[] = [
    'productName',
    'supplierName',
    'priceDate',
    'totalCost',
    'isActive'
  ];

  builds: any[] = [];
  totalRecords = 0;
  pageSize = 10;
  pageIndex = 0;
  searchValue = '';
  filterStatus: number | null = 2;

  private subs: Subscription[] = [];

  constructor(
    private service: ProductBuildService,
    private toast: ToastService,
    private confirm: ConfirmDialogService,
    private translate: TranslateService
  ) {
    this.setColumns();

    this.translate.lang$.subscribe(() => {
      this.setColumns();
    });
  }

  private setColumns(): void {
    this.columns = [
      this.translate.instant('productBuild.product'),
      this.translate.instant('productBuild.supplier'),
      this.translate.instant('productBuild.date'),
      this.translate.instant('productBuild.totalCost'),
      this.translate.instant('common.status')
    ];
  }

  ngOnInit(): void {
    this.loadBuilds(1, this.pageSize);

    const sub = this.service.buildChanged$
      .subscribe(() => {
        this.loadBuilds(this.pageIndex + 1, this.pageSize);
      });

    this.subs.push(sub);
  }

  private loadBuilds(pageNo: number, recordPerPage: number): void {

    const payload = {
      pageNo,
      recordPerPage,
      searchValue: this.searchValue || '',
      status: this.filterStatus
    };

    const sub = this.service.getAll(payload)
      .subscribe({
        next: (res) => {

          // ✅ SAFE DATA BIND
          this.builds = (res?.data ?? []).map((x: any) => ({
            ...x,
            priceDate: x.priceDate ? new Date(x.priceDate).toLocaleDateString() : '',
            totalCost: x.totalCost ?? 0
          }));

          this.totalRecords = res?.totalRecords ?? 0;
        },
        error: () => {
          this.builds = [];
        }
      });

    this.subs.push(sub);
  }

  onSearch(value: string): void {
    this.searchValue = value;
    this.pageIndex = 0;
    this.loadBuilds(1, this.pageSize);
  }

  onStatusChange(status: number | null): void {
    this.filterStatus = status === null ? 2 : status;
    this.pageIndex = 0;
    this.loadBuilds(1, this.pageSize);
  }

  onPageChange(event: { pageIndex: number; pageSize: number }): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadBuilds(this.pageIndex + 1, this.pageSize);
  }

  clearFilters(): void {
    this.searchValue = '';
    this.filterStatus = 2;
    this.pageIndex = 0;
    this.loadBuilds(1, this.pageSize);
  }

  onToggleActive(event: { row: any; isActive: boolean }): void {

    if (!event?.row?.productBuildId) {
      this.toast.error("Invalid Id");
      return;
    }

    const sub = this.service.activeInactive(event.row.productBuildId)
      .subscribe({
        next: (res) => {
          if (res.isSuccess) {
            this.toast.success(res.message);

            // ✅ UI तुरंत update
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

    if (!row?.productBuildId) {
      this.toast.error("Invalid Id");
      return;
    }

    this.confirm.confirm(
      this.translate.instant('common.deleteConfirm')
    ).subscribe((confirmed) => {

      if (!confirmed) return;

      const sub = this.service.delete(row.productBuildId)
        .subscribe({
          next: (res) => {
            if (res.isSuccess) {
              this.toast.success(res.message);

              // ✅ Reload after delete
              this.loadBuilds(this.pageIndex + 1, this.pageSize);
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