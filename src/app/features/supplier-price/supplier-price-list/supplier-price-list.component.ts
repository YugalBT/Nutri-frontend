import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ToastService } from '../../../shared/services/toast.service';
import { ConfirmDialogService } from '../../../shared/services/confirm-dialog.service';
import { CommonService } from '../../../shared/services/common.service';
import { TranslateService } from '../../../i18n/translate.service';
import { SharedModule } from '../../../shared/shared.module';
import { TranslatePipe } from '../../../i18n/translate.pipe';
import { SupplierPriceService } from '../../../core/services/supplier-price/supplier-price.service';
import { FormsModule } from '@angular/forms';
import { ApiResponse } from '../../../core/models/api-response';
import { TokenService } from '../../../shared/services/token.service';
import { DateRangeFilterComponent, DateRangeFilter } from '../../../shared/components/date-range-filter/date-range-filter.component';

@Component({
  selector: 'app-supplier-price-list',
  standalone: true,
  imports: [SharedModule, TranslatePipe, FormsModule, DateRangeFilterComponent],
  templateUrl: './supplier-price-list.component.html',
  styleUrl: './supplier-price-list.component.css',
})
export class SupplierPriceListComponent implements OnInit, OnDestroy {
  materials: any[] = [];
  suppliers: any[] = [];
  selectedSupplierId: string | null = null;
  //selectedMonth: string | null = null;
  filterStartDate: string | null = null;
  filterEndDate: string | null = null;
  private subs: Subscription[] = [];
  isSupplier = false;
  supplierData: any = null;

  constructor(
    private toast: ToastService,
    private confirm: ConfirmDialogService,
    private commonService: CommonService,
    private translate: TranslateService,
    private supplierPriceService: SupplierPriceService,
    private tokenservice: TokenService
  ) { }

  ngOnInit(): void {
    this.isSupplier = !!this.tokenservice.isSupplier();

    if (this.isSupplier) {
      this.supplierData = this.tokenservice.getSupplierData();
      this.selectedSupplierId = this.supplierData?.supplierId;

      if (this.selectedSupplierId) {
        this.onSupplierChange();
      }
    } else {
      this.loadSuppliers();
    }
  }

  loadSuppliers(): void {
    const sub = this.commonService.getSupplierList().subscribe({
      next: (res) => {
        this.suppliers = res?.data ?? [];
        if (this.suppliers.length === 0) {
          this.toast.warning('No suppliers available');
        }
      },
      error: (err) => {
        this.toast.error('Failed to load suppliers');
        console.error('Error loading suppliers:', err);
      },
    });

    this.subs.push(sub);
  }

  onSupplierChange(): void {
    if (!this.selectedSupplierId) {
      this.materials = [];
      return;
    }

    const payload = {
      pageNo: 1,
      recordPerPage: 1000,
      searchValue: '',
      status: 2,
    };

    const sub = this.commonService
      .GetAllMaterialBySupplierId(this.selectedSupplierId, payload)
      .subscribe({
        next: (res: any) => {
          if (!res || !res.data) {
            this.materials = [];
            return;
          }

          this.materials = res.data.map((m: any) => ({
            materialId: m.materialId,
            materialName: m.materialName,
            materialCode: m.materialCode,
            price: m.price ?? 0,
            logisticsCost: m.logisticsCost ?? 0,
            deliveredPrice: m.deliveredPrice ?? 0,
            supplierStatus: this.mapStatusToNumber(m.supplierStatus),
            startDate: m.startDate ?? '',
            endDate: m.endDate ?? '',
            isChanged: false

          }))
        },
        error: (err) => {
          console.error(err);
          this.toast.error('Failed to load materials');
          this.materials = [];
        },
      });

    this.subs.push(sub);
  }

  markChanged(row: any): void {
    row.isChanged = true;
  }

  saveSingle(row: any): void {
    this.saveToApi([row], row);
  }

  saveAll(): void {
    const changedRows = this.materials.filter((m) => m.isChanged);

    if (changedRows.length === 0) {
      this.toast.warning('No changes to save');
      return;
    }

    this.saveToApi(changedRows);
  }

  calculateDeliveredPrice(row: any) {

    const price = Number(row.price) || 0;
    const logistics = Number(row.logisticsCost) || 0;

    row.deliveredPrice = price + logistics;

  }


  onPriceChange(row: any) {
    this.calculateDeliveredPrice(row);
    row.isChanged = true;
  }

  saveToApi(rows: any[], singleRow?: any): void {
    if (!this.selectedSupplierId) {
      this.toast.error('Supplier is required');
      return;
    }
    for (let row of rows) {
      if (!row.startDate || !row.endDate) {
        this.toast.error("Start Date and End Date are required");
        return;
      }

      if (new Date(row.startDate) > new Date(row.endDate)) {
        this.toast.error("Start Date cannot be greater than End Date");
        return;
      }
    }

    const formattedPayload = {
      supplierId: this.selectedSupplierId,
      prices: rows.map(row => ({
        materialId: row.materialId,
        // priceMonth: new Date(row.priceMonth + '-01').toISOString(),
        price: Number(row.price),
        //  discountPercent: Number(row.discountPercent),
        deliveredPrice: Number(row.deliveredPrice),
        supplierStatus: row.supplierStatus,
        startDate: row.startDate ? new Date(row.startDate).toISOString() : null,
        endDate: row.endDate ? new Date(row.endDate).toISOString() : null,
        logisticsCost: Number(row.logisticsCost),
      }))
    };


    const sub = this.supplierPriceService
      .bulkSaveSupplierPrices(formattedPayload)
      .subscribe({
        next: (res: ApiResponse<any>) => {
          if (res.isSuccess) {
            this.toast.success(res.message);
          } else {
            this.toast.error(res.message);
          }

          if (singleRow) {
            singleRow.isChanged = false;
          } else {
            this.materials.forEach((m) => (m.isChanged = false));
          }
        },
        error: (err) => this.toast.error(err?.message),
      });

    this.subs.push(sub);
  }

  clearAll(): void {

    if (this.isSupplier) {
      this.selectedSupplierId = this.supplierData?.supplierId;
      this.onSupplierChange();
    } else {
      this.selectedSupplierId = null;
      this.materials = [];
    }
  }

  onDateFilterChange(filter: DateRangeFilter): void {
    this.filterStartDate = filter.startDate;
    this.filterEndDate = filter.endDate;
    this.applyDateFilter();
  }

  onDateFilterApply(filter: DateRangeFilter): void {
    this.filterStartDate = filter.startDate;
    this.filterEndDate = filter.endDate;
    this.applyDateFilter();
  }

  private applyDateFilter(): void {
    if (!this.filterStartDate || !this.filterEndDate) {
      this.onSupplierChange();
      return;
    }

    const startDate = new Date(this.filterStartDate);
    const endDate = new Date(this.filterEndDate);

    const filtered = this.materials.filter((m) => {
      const materialStart = new Date(m.startDate);
      const materialEnd = new Date(m.endDate);
      return materialStart >= startDate && materialEnd <= endDate;
    });

    this.materials = filtered;
  }

  // private convertToMonthFormat(dateString: string): string {
  //   const date = new Date(dateString);
  //   const year = date.getFullYear();
  //   const month = (date.getMonth() + 1).toString().padStart(2, '0');
  //   return `${year}-${month}`;
  // }
  private mapStatusToNumber(status: string | number): number {

    if (typeof status === 'number') {
      return status;
    }

    switch (status?.toLowerCase()) {
      case 'approved':
        return 0;
      case 'draft':
        return 1;
      default:
        return 2;
    }
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }
}
