import { Component, ElementRef, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../../shared/shared.module';
import { TranslatePipe } from '../../../i18n/translate.pipe';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductBuildService } from '../../../core/services/product-build-service/product-build-service';
import { PERMISSIONS } from '../../../core/constants/permissions.constants';
import { CommonService } from '../../../shared/services/common.service';
import { ToastService } from '../../../shared/services/toast.service';
import { TokenService } from '../../../shared/services/token.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

declare var bootstrap: any;

@Component({
  selector: 'app-product-build-form-page',
  standalone: true,
  imports: [SharedModule, ReactiveFormsModule, FormsModule, TranslatePipe, CommonModule],
  templateUrl: './product-build-form-page.component.html',
  styleUrls: ['./product-build-form-page.component.css']
})
export class ProductBuildFormPageComponent implements OnInit, OnDestroy {
  @ViewChild('materialSearchModal', { static: true }) materialSearchModal!: ElementRef;

  form!: FormGroup;
  materialSearchModalInstance: any;

  products: any[] = [];
  suppliers: any[] = [];
  materialSearchResults: any[] = [];
  formulas: any[] = [];
  totalCostFromDb: number = 0;
  isEdit = false;
  currentId: string = '';
  isSupplier = false;
  supplierData: any = null;
  selectedSupplierId: string | null = null;
  finalCost: number = 0;
  isCalculating = false;
  canSave = false;
  materialSearchTerm = '';
  materialSearchLoading = false;
  materialSearchMessage = '';

  // Display properties for viewing
  displaySupplierName: string = '';
  displayProductName: string = '';
  displayFormulaName: string = '';
  displayIsActive: boolean = false;

  private subs: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private service: ProductBuildService,
    private common: CommonService,
    private toast: ToastService,
    private tokenservice: TokenService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.initForm();
    this.isSupplier = !!this.tokenservice.isSupplier();

    if (this.isSupplier) {
      this.supplierData = this.tokenservice.getSupplierData();
      const supplierId = this.supplierData?.supplierId;

      this.form.patchValue({
        supplierId: supplierId
      });
      this.form.get('supplierId')?.disable();
      this.applySupplierContext(supplierId);
    }

    this.loadSuppliers();

    // Check if we're in edit mode
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEdit = true;
        this.loadDataForEdit(params['id']);
      } else {
        this.setCanSave();
      }
    });
  }

  initForm() {
    this.form = this.fb.group({
      supplierId: ['', Validators.required],
      productId: ['', Validators.required],
      priceDate: [this.getTodayDate(), Validators.required],
      formulaId: [''],
      items: this.fb.array([])
    });
  }

  get items(): FormArray<FormGroup> {
    return this.form.get('items') as FormArray<FormGroup>;
  }

  loadSuppliers() {
    const sub = this.common.getSupplierList().subscribe(res => {
      this.suppliers = res?.data ?? [];
    });
    this.subs.push(sub);
  }

  private applySupplierContext(supplierId: string, row: any = null): void {
    this.selectedSupplierId = supplierId || null;
    this.materialSearchResults = [];
    this.materialSearchTerm = '';
    this.materialSearchMessage = '';
    this.items.clear();

    if (row?.items?.length) {
      row.items.forEach((item: any) => {
        this.items.push(this.buildMaterialItem(item, item));
      });
      this.form.markAsPristine();
    }

    if (supplierId) {
      this.loadSupplierMetadata(supplierId);
    }

    this.calculateFinal();
  }

  private buildMaterialItem(source: any, saved?: any): FormGroup {
    const amount = Number(
      saved?.unitPrice ??
      saved?.amount ??
      source?.unitPrice ??
      source?.deliveredPrice ??
      source?.price ??
      0
    ) || 0;

    return this.fb.group({
      productBuildItemId: saved?.productBuildItemId ?? null,
      materialId: source?.materialId ?? saved?.materialId ?? null,
      materialName: source?.materialName ?? saved?.materialName ?? '',
      materialCode: source?.materialCode ?? saved?.materialCode ?? '',
      amount,
      percentage: Number(saved?.percentage ?? 0),
      calculatedAmount: Number(saved?.calculatedCost ?? saved?.calculatedAmount ?? 0),
      isChanged: false
    });
  }

  private loadSupplierMetadata(supplierId: string): void {
    const sub2 = this.common
      .GetAllProductBySupplierId(supplierId)
      .subscribe(res => {
        this.products = res?.data ?? [];
      });

    const sub3 = this.common
      .GetAllFormulaBySupplierId(supplierId)
      .subscribe(res => {
        this.formulas = res?.data ?? [];

        const formulaId = this.form.value.formulaId;
        if (this.isEdit && formulaId) {
          this.onFormulaChange(formulaId);
        }
      });

    this.subs.push(sub2, sub3);
  }

  loadDataForEdit(id: string) {
    const sub = this.service.getById(id).subscribe({
      next: (res: any) => {
        if (res?.isSuccess && res?.data) {
          const row = res.data;
          this.currentId = row.productBuildId;

          // Set display properties from row
          this.displaySupplierName = row.supplierName;
          this.displayProductName = row.productName;
          this.displayFormulaName = row.formulaName || 'N/A';
          this.displayIsActive = row.isActive;
          this.totalCostFromDb = row.totalCost || 0;

          this.form.patchValue({
            supplierId: row.supplierId,
            productId: row.productId,
            priceDate: row.priceDate?.substring(0, 10) || this.getTodayDate(),
            formulaId: row.formulaId || ''
          });

          this.applySupplierContext(row.supplierId, row);
          this.setCanSave();
        } else {
          this.toast.error('Failed to load data');
          this.back();
        }
      },
      error: () => {
        this.toast.error('Error loading data');
        this.back();
      }
    });
    this.subs.push(sub);
  }

  setCanSave() {
    this.canSave = this.isEdit
      ? this.common.checkPermission(PERMISSIONS.ProductBuildEdit, false)
      : this.common.checkPermission(PERMISSIONS.ProductBuildAdd, false);
  }

  calculateFinal() {
    const baseCost = this.getTotalAmount();
    if (!this.form.value.formulaId) {
      this.finalCost = baseCost;
      return;
    }

    if (this.getTotalPercentage() !== 100) {
      this.finalCost = baseCost;
      return;
    }

    this.isCalculating = true;

    const sub = this.service.calculateFormula({
      formulaId: this.form.value.formulaId,
      baseCost: baseCost
    }).subscribe({
      next: (res: any) => {
        this.finalCost = res?.data || baseCost;
        this.isCalculating = false;
      },
      error: () => {
        this.finalCost = baseCost;
        this.isCalculating = false;
      }
    });
    this.subs.push(sub);
  }

  onFormulaChange(formulaId: string) {
    if (!formulaId) return;

    const selected = this.formulas.find(x => x.formulaId == formulaId);
    if (!selected || !selected.items) return;

    this.items.controls.forEach((item: FormGroup) => {
      const match = selected.items.find(
        (x: any) => x.materialId === item.value.materialId
      );

      if (match) {
        item.patchValue({
          percentage: match.percentage,
          calculatedAmount: match.calculatedCost,
          isChanged: true
        });

        this.calculate(item);
      } else {
        item.patchValue({
          percentage: 0,
          calculatedAmount: 0
        });
      }
    });
    this.calculateFinal();
  }

  getTodayDate(): string {
    const today = new Date();
    const offset = today.getTimezoneOffset();
    const localDate = new Date(today.getTime() - offset * 60000);
    return localDate.toISOString().split('T')[0];
  }

  onSupplierChange(supplierId: string) {
    if (!supplierId) return;

    this.selectedSupplierId = supplierId;
    this.materialSearchResults = [];
    this.materialSearchTerm = '';
    this.materialSearchMessage = '';
    this.items.clear();
    this.loadSupplierMetadata(supplierId);
    this.calculateFinal();
  }

  isMaterialSelected(materialId: string): boolean {
    return this.items.controls.some((ctrl: FormGroup) => ctrl.value.materialId === materialId);
  }

  openMaterialSearch(): void {
    const supplierId = this.form.getRawValue().supplierId || this.selectedSupplierId;
    if (!supplierId) {
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
    const supplierId = this.form.getRawValue().supplierId || this.selectedSupplierId;
    if (!supplierId) {
      this.toast.warning('Please select a supplier first');
      return;
    }

    this.materialSearchLoading = true;
    this.materialSearchMessage = '';

    const payload = {
      pageNo: 1,
      recordPerPage: 20,
      searchValue: this.materialSearchTerm?.trim() || '',
      status: 2
    };

    const sub = this.common
      .GetAllMaterialBySupplierId(supplierId, payload)
      .subscribe({
        next: (res) => {
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
        }
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

    this.items.push(this.buildMaterialItem(material));
    this.calculateFinal();
  }

  removeMaterial(index: number): void {
    if (index < 0 || index >= this.items.length) return;
    this.items.removeAt(index);
    this.calculateFinal();
  }

  calculate(item: FormGroup) {
    const amount = item.value.amount || 0;
    const percentage = item.value.percentage || 0;

    let calculated = 0;

    if (amount > 0) {
      calculated = (amount * percentage) / 100;
    }

    item.patchValue({
      calculatedAmount: calculated,
      isChanged: true
    }, { emitEvent: false });

    this.calculateFinal();
  }

  getTotalAmount() {
    return this.items.controls.reduce((sum, x: any) =>
      sum + (x.value.calculatedAmount || 0), 0);
  }

  getTotalPercentage() {
    return this.items.controls.reduce((sum, x: any) =>
      sum + (x.value.percentage || 0), 0);
  }

  save() {
    if (
      this.isEdit
        ? !this.common.checkPermission(PERMISSIONS.ProductBuildEdit)
        : !this.common.checkPermission(PERMISSIONS.ProductBuildAdd)
    ) {
      return;
    }

    if (this.getTotalPercentage() !== 100) {
      this.toast.error('Total % must be 100');
      return;
    }

    const grouped = this.items.value
      .filter((x: any) => x.percentage > 0)
      .reduce((acc: any, curr: any) => {
        if (!acc[curr.materialId]) {
          acc[curr.materialId] = {
            materialId: curr.materialId,
            percentage: 0,
            unitPrice: curr.amount
          };
        }

        acc[curr.materialId].percentage += curr.percentage;

        return acc;
      }, {});

    const changedItems = Object.values(grouped);

    if (changedItems.length === 0) {
      this.toast.error('Please update at least one material');
      return;
    }

    const payload = {
      supplierId: this.form.getRawValue().supplierId,
      productId: this.form.value.productId,
      priceDate: this.form.value.priceDate,
      formulaId: this.form.value.formulaId,
      items: changedItems,
      productBuildId: this.isEdit ? this.currentId : undefined
    };

    const api = this.isEdit
      ? this.service.update(payload)
      : this.service.create(payload);

    const sub = api.subscribe(res => {
      if (res.isSuccess) {
        this.toast.success(res.message);
        this.service.notifyBuildChanged();
        this.back();
      } else {
        this.toast.error(res.message);
      }
    });

    this.subs.push(sub);
  }

  back() {
    this.router.navigate(['/productbuild']);
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
  }
}
