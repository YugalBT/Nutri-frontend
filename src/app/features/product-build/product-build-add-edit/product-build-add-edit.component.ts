import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { TranslatePipe } from '../../../i18n/translate.pipe';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductBuildService } from '../../../core/services/product-build-service/product-build-service';
import { PERMISSIONS } from '../../../core/constants/permissions.constants';
import { CommonService } from '../../../shared/services/common.service';
import { ToastService } from '../../../shared/services/toast.service';
import { TokenService } from '../../../shared/services/token.service';

declare var bootstrap: any;

@Component({
  selector: 'app-product-build-add-edit',
  standalone: true,
  imports: [SharedModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './product-build-add-edit.component.html',
  styleUrls: ['./product-build-add-edit.component.css']
})
export class ProductBuildAddEditComponent implements OnInit {

  @ViewChild('modal') modal!: ElementRef;

  form!: FormGroup;
  modalInstance: any;

  products: any[] = [];
  suppliers: any[] = [];
  materials: any[] = [];
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

  // Display properties for viewing
  displaySupplierName: string = '';
  displayProductName: string = '';
  displayFormulaName: string = '';
  displayIsActive: boolean = false;

  constructor(
    private fb: FormBuilder,
    private service: ProductBuildService,
    private common: CommonService,
    private toast: ToastService,
    private tokenservice: TokenService,
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
      this.onSupplierChange(supplierId);
    }

    this.loadSuppliers();
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
    this.common.getSupplierList().subscribe(res => {
      this.suppliers = res?.data ?? [];
    });
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

  this.service.calculateFormula({
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

  onSupplierChange(supplierId: string, isEdit = false, row: any = null) {

    if (!supplierId) return;
    this.common
      .GetAllMaterialBySupplierId(supplierId, {})
      .subscribe(res => {

        this.materials = res?.data ?? [];
        this.items.clear();

        this.materials.forEach((m: any) => {
          this.items.push(this.fb.group({
            productBuildItemId: null,
            materialId: m.materialId,
            materialName: m.materialName,
            amount: m.unitPrice || m.deliveredPrice || 0,
            percentage: 0,
            calculatedAmount: 0,
            isChanged: false
          }));
        });

        if (isEdit && row) {
          this.items.controls.forEach((item: FormGroup) => {

            const match = row.items.find(
              (x: any) => x.materialId === item.value.materialId
            );

            if (match) {
              item.patchValue({
                percentage: match.percentage,
                calculatedAmount: match.calculatedCost,
                isChanged: true
              });
              
              // Ensure form control is properly updated
              item.get('percentage')?.setValue(match.percentage, { emitEvent: false });
              item.get('calculatedAmount')?.setValue(match.calculatedCost, { emitEvent: false });
              item.updateValueAndValidity({ emitEvent: false });
            }
          });
          
          // Mark form as pristine to avoid showing dirty state
          this.form.markAsPristine();
          
          // Recalculate final cost after loading edit data
          setTimeout(() => {
            this.calculateFinal();
          }, 100);
        }

      });

    this.common
      .GetAllProductBySupplierId(supplierId)
      .subscribe(res => {
        this.products = res?.data ?? [];

        if (isEdit && row) {
          this.form.patchValue({
            productId: row.productId
          });
        }
      });

    this.common
      .GetAllFormulaBySupplierId(supplierId)
      .subscribe(res => {
        this.formulas = res?.data ?? [];

        if (isEdit && row) {
          this.form.patchValue({
            formulaId: row.formulaId
          });
          
          // Apply formula if exists
          if (row.formulaId) {
            this.onFormulaChange(row.formulaId);
          }
        }
      });


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
  }

  getTotalAmount() {
    return this.items.controls.reduce((sum, x: any) =>
      sum + (x.value.calculatedAmount || 0), 0);
  }

  getTotalPercentage() {
    return this.items.controls.reduce((sum, x: any) =>
      sum + (x.value.percentage || 0), 0);
  }

  openModal(isEdit = false, row: any = null) {
    if (
      isEdit
        ? !this.common.checkPermission(PERMISSIONS.ProductBuildEdit)
        : !this.common.checkPermission(PERMISSIONS.ProductBuildAdd)
    ) {
      return;
    }

    this.isEdit = isEdit;
    this.canSave = isEdit
      ? this.common.checkPermission(PERMISSIONS.ProductBuildEdit, false)
      : this.common.checkPermission(PERMISSIONS.ProductBuildAdd, false);
    
    // Reset form with default values
    this.form.reset({
      supplierId: '',
      productId: '',
      priceDate: this.getTodayDate(),
      formulaId: ''
    });
    
    this.items.clear();

    // Reset display properties
    this.displaySupplierName = '';
    this.displayProductName = '';
    this.displayFormulaName = '';
    this.displayIsActive = false;
    this.totalCostFromDb = 0;

    if (!this.modalInstance) {
      this.modalInstance = new bootstrap.Modal(this.modal.nativeElement);
    }
    
    // ✅ supplier user case
    if (this.isSupplier) {
      const supplierId = this.supplierData?.supplierId;

      this.form.patchValue({
        supplierId: supplierId,
        priceDate: this.getTodayDate()
      });

      this.form.get('supplierId')?.disable();

      this.onSupplierChange(supplierId);
    }

    if (isEdit && row) {

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
        priceDate: row.priceDate?.substring(0, 10) || this.getTodayDate()
      });

      this.onSupplierChange(row.supplierId, true, row);
    }

    this.modalInstance.show();
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

    api.subscribe(res => {
      if (res.isSuccess) {
        this.toast.success(res.message);
        this.service.notifyBuildChanged();
        this.closeModal();
      } else {
        this.toast.error(res.message);
      }
    });
  }

  closeModal() {
    this.modalInstance?.hide();
  }
}
