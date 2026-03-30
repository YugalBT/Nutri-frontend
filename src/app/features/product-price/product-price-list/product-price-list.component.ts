import { CommonModule } from '@angular/common';
import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { ProductSellingPriceService } from '../../../core/services/product-selling-price/product-selling-price.service';
import { ProductPriceAddEditComponent } from '../product-price-add-edit/product-price-add-edit.component';

import { ToastService } from '../../../shared/services/toast.service';
import { ConfirmDialogService } from '../../../shared/services/confirm-dialog.service';

import { TranslateService } from '../../../i18n/translate.service';
import { ReusableTableComponent } from '../../../shared/components/reusable-table/reusable-table.component';
import { GlobalSearchComponent } from '../../../shared/components/global-search/global-search.component';
import { TranslatePipe } from '../../../i18n/translate.pipe';
import { CommonService } from '../../../shared/services/common.service';
import { PERMISSIONS } from '../../../core/constants/permissions.constants';

@Component({
  selector: 'app-product-price-list',
  standalone: true,
  imports: [CommonModule, ProductPriceAddEditComponent,ReusableTableComponent ,GlobalSearchComponent,TranslatePipe],
  templateUrl: './product-price-list.component.html',
  styleUrl: './product-price-list.component.css'
})
export class ProductPriceListComponent implements OnInit, OnDestroy {

  @ViewChild('priceModal')
  priceModal!: ProductPriceAddEditComponent;

  columns: string[] = [];

  columnFields: string[] = [
    'productName',
    'productCode',
    'priceMonth',
    'previousMonthPrice',
    'suggestedPrice',
    'customerPrice',
    'commissionPercent',
    'marginPercent',
    'isActive'
  ];

  prices: any[] = [];

  totalRecords = 0;

  pageSize = 10;

  pageIndex = 0;

  searchValue = '';

  filterStatus: number | null = 2;
  canAddProductPrice = false;
  viewPermission = PERMISSIONS.ProductPricingView;
  editPermission = PERMISSIONS.ProductPricingEdit;
  deletePermission = PERMISSIONS.ProductPricingDelete;

  private subs: Subscription[] = [];

  constructor(
    private priceService: ProductSellingPriceService,
    private toast: ToastService,
    private confirm: ConfirmDialogService,
    private translate: TranslateService,
    private commonService: CommonService
  ) {

    this.setColumns();

    this.translate.lang$
      .subscribe(() => {
        this.setColumns();
      });

  }

  private setColumns() {

    this.columns = [

      this.translate.instant('productPrice.product'),
      this.translate.instant('productPrice.code'),
      this.translate.instant('productPrice.month'),
      this.translate.instant('productPrice.previousPrice'),
      this.translate.instant('productPrice.suggestedPrice'),
      this.translate.instant('productPrice.customerPrice'),
      this.translate.instant('productPrice.commission'),
      this.translate.instant('productPrice.margin'),
      this.translate.instant('common.status')


    ];

  }

  ngOnInit() {
    this.canAddProductPrice = this.commonService.checkPermission(PERMISSIONS.ProductPricingAdd, false);
    if (!this.commonService.checkPermission(PERMISSIONS.ProductPricingView, false)) {
      return;
    }

    this.loadPrices(1, this.pageSize);

    const sub =
      this.priceService.priceChanged$
        .subscribe(() => {

          this.loadPrices(this.pageIndex + 1, this.pageSize);

        });

    this.subs.push(sub);

  }

  private loadPrices(pageNo: number, recordPerPage: number) {
    const payload = {
      pageNo,
      recordPerPage,
      searchValue: this.searchValue,
      status: this.filterStatus
    };

    const sub =
      this.priceService
        .getAllPrice(payload)
        .subscribe({
          next: (res) => {
            this.prices = res?.data ?? [];
            this.totalRecords = res?.totalRecords ?? 0;
          },

          error: () => {

            this.prices = [];

          }

        });

    this.subs.push(sub);

  }

  onSearch(value: string) {

    this.searchValue = value;

    this.pageIndex = 0;

    this.loadPrices(1, this.pageSize);

  }

  onStatusChange(status: number | null) {

    this.filterStatus = status === null ? 2 : status;

    this.pageIndex = 0;

    this.loadPrices(1, this.pageSize);

  }

  onPageChange(event: any) {

    this.pageIndex = event.pageIndex;

    this.pageSize = event.pageSize;

    this.loadPrices(this.pageIndex + 1, this.pageSize);

  }

  clearFilters() {

    this.searchValue = '';

    this.filterStatus = 2;

    this.pageIndex = 0;

    this.loadPrices(1, this.pageSize);

  }

  onToggleActive(event: { row: any; isActive: boolean }) {
    if (!this.commonService.checkPermission(PERMISSIONS.ProductPricingEdit)) {
      return;
    }
    if (!event?.row?.productPriceId) {
      debugger;

      this.toast.error("Invalid Price Id");

      return;

    }

    const sub =
      this.priceService
        .activeInActive(event.row.productPriceId)
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

  onDelete(row: any) {
    if (!this.commonService.checkPermission(PERMISSIONS.ProductPricingDelete)) {
      return;
    }

    if (!row?.productPriceId) {

      this.toast.error("Invalid Price Id");

      return;

    }

    this.confirm.confirm(
      this.translate.instant('common.deleteConfirm')
    ).subscribe((confirmed) => {

      if (!confirmed) return;

      const sub =
        this.priceService
          .deletePrice(row.productPriceId)
          .subscribe({

            next: (res) => {

              if (res.isSuccess) {

                this.toast.success(res.message);

                this.priceService.notifyPriceChanged();

              } else {

                this.toast.error(res.message);

              }

            },

            error: (err) => this.toast.error(err?.error?.message)

          });

      this.subs.push(sub);

    });

  }

  // exportPrices() {

  //   const sub =
  //     this.priceService
  //       .exportPrices()
  //       .subscribe((blob: Blob) => {

  //         const url = window.URL.createObjectURL(blob);

  //         const link = document.createElement('a');

  //         link.href = url;

  //         link.download = 'product-prices.csv';

  //         link.click();

  //         window.URL.revokeObjectURL(url);

  //         this.toast.success('Prices exported successfully');

  //       });

  //   this.subs.push(sub);

  // }

  // importPrices(event: any) {

  //   const file = event.target.files[0];

  //   if (!file) return;

  //   const sub =
  //     this.priceService
  //       .importPrices(file)
  //       .subscribe(res => {

  //         if (res.isSuccess) {

  //           this.toast.success(res.message);

  //           this.loadPrices(1, this.pageSize);

  //         } else {

  //           this.toast.error(res.message);

  //         }

  //       });

  //   this.subs.push(sub);

  // }

  ngOnDestroy() {

    this.subs.forEach(s => s.unsubscribe());

  }

}
