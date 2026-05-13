import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { ToastService } from '../../../shared/services/toast.service';
import { CommonService } from '../../../shared/services/common.service';
import { SharedModule } from '../../../shared/shared.module';
import { TranslatePipe } from '../../../i18n/translate.pipe';
import { SupplierPriceService } from '../../../core/services/supplier-price/supplier-price.service';
import { FormsModule } from '@angular/forms';
import { ApiResponse } from '../../../core/models/api-response';
import { TokenService } from '../../../shared/services/token.service';
import { DateRangeFilterComponent, DateRangeFilter } from '../../../shared/components/date-range-filter/date-range-filter.component';

declare var bootstrap: any;

@Component({
  selector: 'app-supplier-price-list',
  standalone: true,
  imports: [SharedModule, TranslatePipe, FormsModule, DateRangeFilterComponent],
  templateUrl: './supplier-price-list.component.html',
  styleUrl: './supplier-price-list.component.css',
})
export class SupplierPriceListComponent implements OnInit, OnDestroy {
  @ViewChild('materialSearchModal', { static: true }) materialSearchModal!: ElementRef;

  /**
   * 'deatech'  → show Deatech-owned materials (SupplierId IS NULL).
   *              Logistics Cost + Delivered Price columns are visible.
   *              Supplier selector shown so office can pick whose prices to edit.
   * 'supplier' → show this supplier's own materials.
   *              Only the final Price column is shown (no logistics breakdown).
   */
  @Input() mode: 'deatech' | 'supplier' = 'supplier';

  /** True when the Logistics Cost and Delivered Price columns should be shown. */
  get showLogisticsCols(): boolean { return this.mode === 'deatech'; }

  /** True when viewing Deatech's own raw material costs (no supplier selector needed). */
  get isDeatechMode(): boolean { return this.mode === 'deatech'; }

  materials: any[] = [];
  allMaterials: any[] = [];
  suppliers: any[] = [];
  selectedSupplierId: string | null = null;
  filterStartDate: string | null = null;
  filterEndDate: string | null = null;

  materialSearchModalInstance: any;
  materialSearchResults: any[] = [];
  materialSearchTerm = '';
  materialSearchLoading = false;
  materialSearchMessage = '';

  private subs: Subscription[] = [];
  isSupplier = false;
  supplierData: any = null;

  constructor(
    private toast: ToastService,
    private commonService: CommonService,
    private supplierPriceService: SupplierPriceService,
    private tokenservice: TokenService
  ) {}

  ngOnInit(): void {
    this.isSupplier = !!this.tokenservice.isSupplier();

    if (this.isSupplier) {
      // Supplier portal: load their own prices automatically
      this.supplierData = this.tokenservice.getSupplierData();
      this.selectedSupplierId = this.supplierData?.supplierId || null;
      if (this.selectedSupplierId) {
        this.loadSavedPrices();
      }
    } else if (this.isDeatechMode) {
      // Deatech office view: no supplier selector — load Deatech's own materials
      this.selectedSupplierId = null;
      this.loadSavedPrices();
    } else {
      // Admin/Employee viewing a specific supplier's prices: show supplier dropdown
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
      this.resetMaterialSelection();
      return;
    }

    this.filterStartDate = null;
    this.filterEndDate = null;
    this.resetMaterialSelection();
    this.loadSavedPrices();
  }

  /** Load already-saved prices from the API for the currently selected supplier (or Deatech). */
  loadSavedPrices(): void {
    // Deatech mode has no supplierId — that is intentional.
    // Standard supplier/admin mode requires a supplierId to be selected first.
    if (!this.selectedSupplierId && !this.isDeatechMode) return;

    const payload: any = {
      pageNo: 1,
      recordPerPage: 1000,
      ownership: this.mode,   // 'deatech' or 'supplier'
      savedOnly: true,        // only return materials with an existing price record
    };

    if (this.filterStartDate) { payload['startDate'] = this.filterStartDate; }
    if (this.filterEndDate)   { payload['endDate']   = this.filterEndDate;   }

    // Use the correct endpoint: POST /Supplier/GetAllSupplierPrice
    // supplierId is null for deatech mode — the backend handles this correctly.
    const sub = this.commonService.GetAllMaterialBySupplierId(
      this.selectedSupplierId,
      payload,
    ).subscribe({
      next: (res: any) => {
        if (res?.isSuccess && Array.isArray(res.data) && res.data.length > 0) {
          this.allMaterials = res.data.map((m: any) => this.buildMaterialRow(m));
          this.syncDisplayedMaterials();
        } else {
          this.allMaterials = [];
          this.materials = [];
        }
      },
      error: () => {
        this.allMaterials = [];
        this.materials = [];
      }
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
    const changedRows = this.allMaterials.filter((m) => m.isChanged);

    if (changedRows.length === 0) {
      this.toast.warning('No changes to save');
      return;
    }

    this.saveToApi(changedRows);
  }

  calculateDeliveredPrice(row: any): void {
    const price = Number(row.price) || 0;
    const logistics = Number(row.logisticsCost) || 0;

    row.deliveredPrice = price + logistics;
  }

  onPriceChange(row: any): void {
    this.calculateDeliveredPrice(row);
    row.isChanged = true;
    this.syncDisplayedMaterials();
  }

  saveToApi(rows: any[], singleRow?: any): void {
    // In deatech mode there is no supplier — suppress this check
    if (!this.selectedSupplierId && !this.isDeatechMode) {
      this.toast.error('Supplier is required');
      return;
    }

    for (const row of rows) {
      if (!row.startDate || !row.endDate) {
        this.toast.error('Start Date and End Date are required');
        return;
      }

      if (new Date(row.startDate) > new Date(row.endDate)) {
        this.toast.error('Start Date cannot be greater than End Date');
        return;
      }
    }

    const formattedPayload = {
      supplierId: this.selectedSupplierId,
      prices: rows.map((row) => ({
        materialId: row.materialId,
        price: Number(row.price),
        deliveredPrice: Number(row.deliveredPrice),
        supplierStatus: row.supplierStatus,
        startDate: row.startDate ? new Date(row.startDate).toISOString() : null,
        endDate: row.endDate ? new Date(row.endDate).toISOString() : null,
        logisticsCost: Number(row.logisticsCost),
      })),
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
            this.allMaterials.forEach((m) => (m.isChanged = false));
          }
        },
        error: (err) => this.toast.error(err?.message),
      });

    this.subs.push(sub);
  }

  clearAll(): void {
    this.filterStartDate = null;
    this.filterEndDate = null;
    this.clearMaterialSearch();

    if (this.isSupplier || this.isDeatechMode) {
      // Supplier or Deatech office view: keep the implicit supplierId and reload
      this.resetMaterialSelection();
      this.loadSavedPrices();
    } else {
      // Admin viewing supplier prices: reset supplier selection
      this.selectedSupplierId = null;
      this.resetMaterialSelection();
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
    if (this.selectedSupplierId || this.isDeatechMode) {
      this.loadSavedPrices();   // reload from API with date range
    } else {
      this.applyDateFilter();   // fallback: filter in memory
    }
  }

  private applyDateFilter(): void {
    if (!this.filterStartDate || !this.filterEndDate) {
      this.materials = [...this.allMaterials];
      return;
    }

    const startDate = new Date(this.filterStartDate);
    const endDate = new Date(this.filterEndDate);

    this.materials = this.allMaterials.filter((m) => {
      if (!m.startDate || !m.endDate) {
        return true;
      }

      const materialStart = new Date(m.startDate);
      const materialEnd = new Date(m.endDate);
      return materialStart >= startDate && materialEnd <= endDate;
    });
  }

  private resetMaterialSelection(): void {
    this.allMaterials = [];
    this.materials = [];
    this.materialSearchResults = [];
    this.materialSearchTerm = '';
    this.materialSearchMessage = '';
  }

  private syncDisplayedMaterials(): void {
    if (!this.filterStartDate || !this.filterEndDate) {
      this.materials = [...this.allMaterials];
      return;
    }

    const startDate = new Date(this.filterStartDate);
    const endDate = new Date(this.filterEndDate);

    this.materials = this.allMaterials.filter((m) => {
      if (!m.startDate || !m.endDate) {
        return true;
      }

      const materialStart = new Date(m.startDate);
      const materialEnd = new Date(m.endDate);
      return materialStart >= startDate && materialEnd <= endDate;
    });
  }

  private buildMaterialRow(material: any): any {
    return {
      materialId: material?.materialId,
      materialName: material?.materialName || '',
      materialCode: material?.materialCode || '',
      price: Number(material?.price ?? material?.unitPrice ?? material?.deliveredPrice ?? 0),
      logisticsCost: Number(material?.logisticsCost ?? 0),
      deliveredPrice: Number(material?.deliveredPrice ?? material?.price ?? material?.unitPrice ?? 0),
      supplierStatus: this.mapStatusToNumber(material?.supplierStatus ?? material?.status ?? 2),
      startDate: material?.startDate ? this.toDateInputValue(material.startDate) : '',
      endDate: material?.endDate ? this.toDateInputValue(material.endDate) : '',
      category: material?.category || '',
      isChanged: false,
    };
  }

  private toDateInputValue(value: string): string {
    if (!value) return '';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return String(value).substring(0, 10);
    }

    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60000);
    return localDate.toISOString().split('T')[0];
  }

  isMaterialSelected(materialId: string): boolean {
    return this.allMaterials.some((row) => row.materialId === materialId);
  }

  openMaterialSearch(): void {
    if (!this.selectedSupplierId && !this.isDeatechMode) {
      this.toast.warning('Please select a supplier first');
      return;
    }

    if (!this.materialSearchModalInstance) {
      this.materialSearchModalInstance = new bootstrap.Modal(
        this.materialSearchModal.nativeElement,
        { backdrop: 'static' }
      );
    }

    this.materialSearchModalInstance.show();

    if (!this.materialSearchResults.length) {
      this.searchMaterials();
    }
  }

  closeMaterialSearch(): void {
    this.materialSearchModalInstance?.hide();
  }

  searchMaterials(): void {
    if (!this.selectedSupplierId && !this.isDeatechMode) {
      this.toast.warning('Please select a supplier first');
      return;
    }

    this.materialSearchLoading = true;
    this.materialSearchMessage = '';

    const payload = {
      pageNo: 1,
      recordPerPage: 20,
      searchValue: this.materialSearchTerm?.trim() || '',
      status: 2,
      ownership: this.mode,
    };

    const sub = this.commonService
      .GetAllMaterialBySupplierId(this.selectedSupplierId, payload)
      .subscribe({
        next: (res: any) => {
          this.materialSearchResults = res?.data ?? [];
          this.materialSearchMessage = this.materialSearchResults.length
            ? ''
            : 'No materials found';
          this.materialSearchLoading = false;
        },
        error: () => {
          this.materialSearchResults = [];
          this.materialSearchMessage = 'Failed to load materials';
          this.materialSearchLoading = false;
        },
      });

    this.subs.push(sub);
  }

  clearMaterialSearch(): void {
    this.materialSearchTerm = '';
    this.materialSearchResults = [];
    this.materialSearchMessage = '';
  }

  addMaterial(material: any): void {
    if (!material?.materialId) return;

    if (this.isMaterialSelected(material.materialId)) {
      this.toast.warning('Material already added');
      return;
    }

    const row = this.buildMaterialRow(material);
    row.isChanged = true;
    this.allMaterials.push(row);
    this.syncDisplayedMaterials();
  }

  removeMaterial(materialId: string): void {
    const index = this.allMaterials.findIndex((row) => row.materialId === materialId);
    if (index === -1) return;

    this.allMaterials.splice(index, 1);
    this.syncDisplayedMaterials();
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

  importSupplierPrices(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    // Reset file input so the same file can be re-imported if needed
    event.target.value = '';

    if (!this.selectedSupplierId && !this.isDeatechMode) {
      this.toast.error('Please select supplier');
      return;
    }

    const sub = this.supplierPriceService
      .importSupplierPrices(file, this.selectedSupplierId)
      .subscribe({
        next: (res: ApiResponse<any>) => {
          if (res.isSuccess) {
            this.toast.success(res.message || 'Import successful');
            this.loadSavedPrices();   // works for all modes (supplier, deatech, admin)
          } else {
            this.toast.error(res.message || 'Import failed');
          }
        },
        error: (err) => this.toast.error(err?.message || 'Import failed'),
      });

    this.subs.push(sub);
  }

  exportSupplierPrices(): void {
    if (!this.selectedSupplierId && !this.isDeatechMode) {
      this.toast.error('Please select supplier');
      return;
    }

    const sub = this.supplierPriceService
      .exportSupplierPrices(this.selectedSupplierId)
      .subscribe({
        next: (res) => {
          if (!res?.isSuccess || !res?.data) {
            this.toast.error(res?.message || 'Export failed');
            return;
          }

          this.downloadBlob(res.data, 'supplier-prices.csv');
          this.toast.success('Export successful');
        },
        error: (err) => this.toast.error(err?.message || 'Export failed'),
      });

    this.subs.push(sub);
  }

  downloadSampleCSV(): void {
    const sub = this.supplierPriceService
      .downloadSampleCSV()
      .subscribe({
        next: (res) => {
          if (!res?.isSuccess || !res?.data) {
            this.toast.error(res?.message || 'Download failed');
            return;
          }

          this.downloadBlob(res.data, 'supplier-price-sample.csv');
          this.toast.success('Sample downloaded');
        },
        error: (err) => this.toast.error(err?.message || 'Download failed'),
      });

    this.subs.push(sub);
  }

  /** Decode a base64 string from the API and trigger a browser file download. */
  private downloadBlob(base64: string, filename: string): void {
    const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    const blob = new Blob([bytes], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }
}
