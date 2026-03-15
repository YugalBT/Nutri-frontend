import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';

import { Subscription } from 'rxjs';

import { ProductAddEditComponent } from '../product-add-edit/product-add-edit.component';

import { ProductService } from '../../../core/services/product/product.service';

import { ToastService } from '../../../shared/services/toast.service';

import { ConfirmDialogService } from '../../../shared/services/confirm-dialog.service';

import { TranslateService } from '../../../i18n/translate.service';

import { ReusableTableComponent } from '../../../shared/components/reusable-table/reusable-table.component';

import { GlobalSearchComponent } from '../../../shared/components/global-search/global-search.component';

import { TranslatePipe } from '../../../i18n/translate.pipe';


@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    ReusableTableComponent,
    ProductAddEditComponent,
    GlobalSearchComponent,
    TranslatePipe
  ],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit, OnDestroy {


  @ViewChild('productModal')
  productModal!: ProductAddEditComponent;


  columns: string[] = [];

  columnFields: string[] = [
    'productName',
    'productCode',
    'effectiveDate',
    'isActive'
  ];


  products: any[] = [];

  totalRecords = 0;

  pageSize = 10;

  pageIndex = 0;


  searchValue = '';

  filterStatus: number | null = 2;


  private subs: Subscription[] = [];


  constructor(
    private productService: ProductService,
    private toast: ToastService,
    private confirm: ConfirmDialogService,
    private translate: TranslateService
  ) {

    this.setColumns();

    this.translate.lang$.subscribe(() => {

      this.setColumns();

    });

  }


  private setColumns() {

    this.columns = [
      this.translate.instant('product.name'),
      this.translate.instant('product.code'),
      this.translate.instant('product.effectiveDate'),
      this.translate.instant('common.status')
    ];

  }


  ngOnInit() {

    this.loadProducts(1, this.pageSize);

    const sub =
      this.productService.productsChanged$
        .subscribe(() => {

          this.loadProducts(this.pageIndex + 1, this.pageSize);

        });

    this.subs.push(sub);

  }


  loadProducts(pageNo: number, recordPerPage: number) {

    const payload = {

      pageNo,

      recordPerPage,

      searchValue: this.searchValue,

      status: this.filterStatus

    };


    const sub = this.productService
      .getAll(payload)
      .subscribe(res => {

        this.products = res?.data ?? [];

        this.totalRecords = res?.totalRecords ?? 0;

      });

    this.subs.push(sub);

  }


  onSearch(value: string) {

    this.searchValue = value;

    this.pageIndex = 0;

    this.loadProducts(1, this.pageSize);

  }


  onStatusChange(status: number | null) {

    this.filterStatus = status === null ? 2 : status;

    this.pageIndex = 0;

    this.loadProducts(1, this.pageSize);

  }


  onPageChange(event: any) {

    this.pageIndex = event.pageIndex;

    this.pageSize = event.pageSize;

    this.loadProducts(this.pageIndex + 1, this.pageSize);

  }


  clearFilters() {

    this.searchValue = '';

    this.filterStatus = 2;

    this.pageIndex = 0;

    this.loadProducts(1, this.pageSize);

  }


  onToggleActive(event: any) {

    const sub = this.productService
      .activeInActive(event.row.productId)
      .subscribe(res => {

        if (res.isSuccess) {

          this.toast.success(res.message);

          event.row.isActive = !event.row.isActive;

        } else {

          this.toast.error(res.message);

        }

      });

    this.subs.push(sub);

  }


  onDelete(row: any) {

    this.confirm
      .confirm(this.translate.instant('common.deleteConfirm'))
      .subscribe(confirmed => {

        if (!confirmed) return;

        const sub = this.productService
          .deleteProduct(row.productId)
          .subscribe(res => {

            if (res.isSuccess) {

              this.toast.success(res.message);

              this.productService.notifyProductChanged();

            } else {

              this.toast.error(res.message);

            }

          });

        this.subs.push(sub);

      });

  }


  ngOnDestroy() {

    this.subs.forEach(s => s.unsubscribe());

  }

}