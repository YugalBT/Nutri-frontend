import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { ToastService } from '../../../shared/services/toast.service';
import { TranslateService } from '../../../i18n/translate.service';

import { ReusableTableComponent } from '../../../shared/components/reusable-table/reusable-table.component';
import { GlobalSearchComponent } from '../../../shared/components/global-search/global-search.component';
import { TranslatePipe } from '../../../i18n/translate.pipe';

import { ProductPriceAddEditComponent } from '../product-price-add-edit/product-price-add-edit.component';
import { ProductSellingPriceService } from '../../../core/services/product-selling-price/product-selling-price.service';

@Component({
  selector: 'app-product-price-list',
  standalone: true,
  imports: [
    ReusableTableComponent,
    GlobalSearchComponent,
    ProductPriceAddEditComponent,
    TranslatePipe
  ],
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
    'marginPercent'
  ];

  prices: any[] = [];

  totalRecords = 0;
  pageSize = 10;
  pageIndex = 0;

  searchValue = '';
  filterStatus: number | null = 2;

  private subs: Subscription[] = [];

  constructor(
    private priceService: ProductSellingPriceService,
    private toast: ToastService,
    private translate: TranslateService
  ) {

    this.setColumns();

    this.translate.lang$.subscribe(() => {
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

      this.translate.instant('productPrice.margin')

    ];

  }

  ngOnInit() {

    this.loadPrices(1, this.pageSize);

    const sub =
      this.priceService.priceChanged$
        .subscribe(() => {

          this.loadPrices(this.pageIndex + 1, this.pageSize);

        });

    this.subs.push(sub);

  }

  loadPrices(pageNo: number, recordPerPage: number) {

    const payload = {
      pageNo,
      recordPerPage,
      searchValue: this.searchValue,
      status: this.filterStatus
    };

    const sub = this.priceService
      .getAllPrice(payload)
      .subscribe(res => {
        this.prices = res?.data ?? [];
        this.totalRecords = res?.totalRecords ?? 0;
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

  ngOnDestroy() {

    this.subs.forEach(s => s.unsubscribe());

  }

}