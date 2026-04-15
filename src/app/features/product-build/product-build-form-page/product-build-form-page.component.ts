import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../../shared/shared.module';
import { TranslatePipe } from '../../../i18n/translate.pipe';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductBuildService } from '../../../core/services/product-build-service/product-build-service';
import { PERMISSIONS } from '../../../core/constants/permissions.constants';
import { CommonService } from '../../../shared/services/common.service';
import { ToastService } from '../../../shared/services/toast.service';
import { TokenService } from '../../../shared/services/token.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-product-build-form-page',
  standalone: true,
  imports: [SharedModule, ReactiveFormsModule, TranslatePipe, CommonModule],
  templateUrl: './product-build-form-page.component.html',
  styleUrls: ['./product-build-form-page.component.css']
})
export class ProductBuildFormPageComponent implements OnInit, OnDestroy {
  form!: FormGroup;

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
      this.onSupplierChange(supplierId);
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
            priceDate: row.priceDate?.substring(0, 10) || this.getTodayDate()
          });

          this.onSupplierChange(row.supplierId, true, row);
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

  onSupplierChange(supplierId: string, isEdit = false, row: any = null) {
    if (!supplierId) return;

    const sub1 = this.common
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

              item.get('percentage')?.setValue(match.percentage, { emitEvent: false });
              item.get('calculatedAmount')?.setValue(match.calculatedCost, { emitEvent: false });
              item.updateValueAndValidity({ emitEvent: false });
            }
          });

          this.form.markAsPristine();

          setTimeout(() => {
            this.calculateFinal();
          }, 100);
        }
      });

    const sub2 = this.common
      .GetAllProductBySupplierId(supplierId)
      .subscribe(res => {
        this.products = res?.data ?? [];

        if (isEdit && row) {
          this.form.patchValue({
            productId: row.productId
          });
        }
      });

    const sub3 = this.common
      .GetAllFormulaBySupplierId(supplierId)
      .subscribe(res => {
        this.formulas = res?.data ?? [];

        if (isEdit && row) {
          this.form.patchValue({
            formulaId: row.formulaId
          });

          if (row.formulaId) {
            this.onFormulaChange(row.formulaId);
          }
        }
      });

    this.subs.push(sub1, sub2, sub3);
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
