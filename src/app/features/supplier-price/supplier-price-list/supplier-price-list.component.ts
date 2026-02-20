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
  private subs: Subscription[] = [];

  constructor(
    private toast: ToastService,
    private confirm: ConfirmDialogService,
    private commonService: CommonService,
    private translate: TranslateService,
    private supplierPriceService: SupplierPriceService
  ) {}

  ngOnInit(): void {
    this.loadSuppliers();
  }

  loadSuppliers(): void {
    const sub = this.commonService.getSupplierList()
      .subscribe({
        next: (res) => {
          this.suppliers = res?.data ?? [];
        },
        error: () => this.toast.error('Failed to load suppliers')
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
    status: 2
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
          price: m.price ?? null,
          status: m.status ?? 0,   // 0 = Draft default
          isChanged: false
        }));

      },
      error: (err) => {
        console.error(err);
        this.toast.error('Failed to load materials');
        this.materials = [];
      }
    });

  this.subs.push(sub);
}

  markChanged(row: any): void {
    row.isChanged = true;
  }

  saveSingle(row: any): void {

    const payload = [{
      supplierId: this.selectedSupplierId,
      materialId: row.materialId,
      price: row.price,
      status: row.status
    }];

    this.saveToApi(payload, row);
  }

  saveAll(): void {

    const changedRows = this.materials.filter(m => m.isChanged);

    if (changedRows.length === 0) {
      this.toast.warning('No changes to save');
      return;
    }

    const payload = changedRows.map(row => ({
      supplierId: this.selectedSupplierId,
      materialId: row.materialId,
      price: row.price,
      status: row.status
    }));
    

    this.saveToApi(payload);
  }

  saveToApi(payload: any[], singleRow?: any): void {
    debugger;
    const sub = this.supplierPriceService
      .bulkSaveSupplierPrices(payload)
      .subscribe({
        next: (res : ApiResponse<any>) => {
            if (res.isSuccess) {
              this.toast.success(res.message);
            }else{
              this.toast.error(res.message);
            }
          if (singleRow) {
            singleRow.isChanged = false;
          } else {
            this.materials.forEach(m => m.isChanged = false);
          }
        },
        error: (err) => this.toast.error(err?.message || 'Failed to save supplier prices')
      });

    this.subs.push(sub);
  }

  clearAll(): void {
    this.selectedSupplierId = null;
    this.materials = [];
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }
}