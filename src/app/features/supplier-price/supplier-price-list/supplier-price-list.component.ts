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

@Component({
  selector: 'app-supplier-price-list',
  standalone: true,
  imports: [SharedModule, TranslatePipe, FormsModule],
  templateUrl: './supplier-price-list.component.html',
  styleUrl: './supplier-price-list.component.css',
})
export class SupplierPriceListComponent implements OnInit, OnDestroy {
  materials: any[] = [];
  suppliers: any[] = [];
  selectedSupplierId: string | null = null;
  selectedMonth: string | null = null;
  private subs: Subscription[] = [];

  constructor(
    private toast: ToastService,
    private confirm: ConfirmDialogService,
    private commonService: CommonService,
    private translate: TranslateService,
    private supplierPriceService: SupplierPriceService,
  ) { }

  ngOnInit(): void {
    this.loadSuppliers();
  }

  loadSuppliers(): void {
    const sub = this.commonService.getSupplierList().subscribe({
      next: (res) => {
        this.suppliers = res?.data ?? [];
      },
      error: () => this.toast.error('Failed to load suppliers'),
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
            discountPercent: m.discountPercent ?? 0,
            deliveredPrice: m.deliveredPrice ?? 0,
            supplierStatus: this.mapStatusToNumber(m.supplierStatus),
            priceMonth: m.priceMonth
              ? this.convertToMonthFormat(m.priceMonth)
              : '',
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
    const discount = Number(row.discountPercent) || 0;
    const discountValue = (price * discount) / 100;
    row.deliveredPrice = price - discountValue;

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

    const formattedPayload = {
      supplierId: this.selectedSupplierId,
      prices: rows.map(row => ({
        materialId: row.materialId,
        priceMonth: new Date(row.priceMonth + '-01').toISOString(),
        price: Number(row.price),
        discountPercent: Number(row.discountPercent),
        deliveredPrice: Number(row.deliveredPrice),
        supplierStatus: row.supplierStatus
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
    this.selectedSupplierId = null;
    this.materials = [];
  }
  private convertToMonthFormat(dateString: string): string {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${year}-${month}`;
  }
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
