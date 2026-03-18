import { Component, ElementRef, ViewChild } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../../i18n/translate.pipe';
import {
  OperatorList,
  OperatorsAndRationsList,
} from '../../../core/models/operator-list';
import { RationList } from '../../../core/models/ration-list';
import { CommonService } from '../../../shared/services/common.service';
import { ToastService } from '../../../shared/services/toast.service';
import { SupplierPricingFormulaService } from '../../../core/services/supplier/supplier-pricing-formula.service';
import { Subscription } from 'rxjs';

declare var bootstrap: any;

@Component({
  selector: 'app-supplier-pricing-formula-add-edit',
  standalone: true,
  imports: [SharedModule, FormsModule, TranslatePipe],
  templateUrl: './supplier-pricing-formula-add-edit.component.html',
  styleUrl: './supplier-pricing-formula-add-edit.component.css',
})
export class SupplierPricingFormulaAddEditComponent {
  @ViewChild('expressionModal', { static: true }) expressionModal!: ElementRef;
selectedProductId: string | null = null;
  modal: any;
  isEdit = false;
  formulaId: string | null = null;
products: any[] = [];
  expressionName = '';
  expressionTokens: any[] = [];
  insertIndex: number | null = null;
  operators: OperatorList[] = [];
  rations: RationList[] = [];
  expressionItems: OperatorsAndRationsList[] = [];
  isvalidated: boolean = false;
  validatedResult: string | null = null;

  materials: any[] = [];
  suppliers: any[] = [];
  selectedSupplierId: string | null = null;
  selectedMonth: string | null = null;
  private subs: Subscription[] = [];

  selectedStatus: number = 1;
  constructor(
    private commonService: CommonService,
    private supplierformulaService: SupplierPricingFormulaService,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.modal = new bootstrap.Modal(this.expressionModal.nativeElement, {
      backdrop: 'static',
    });
    this.loadExpressionItems();
    this.loadSuppliers();
     this.loadProducts(); 
  }

  /* ================= MODAL ================= */

  openModal(edit = false, data?: any): void {
    this.isEdit = edit;
    this.insertIndex = null;
    this.isvalidated = false;
    this.validatedResult = null;
    this.selectedProductId = null;
    this.resetForm(); 

    if (edit && data) {
      this.formulaId = data.formulaId;
      this.expressionName = data.formulaName;
      this.selectedSupplierId = data.supplierId;
        this.selectedStatus =
      data.formulaStatus === 'Active' ? 0 :
      data.formulaStatus === 'Draft' ? 1 : 1;

      this.expressionTokens = this.mapFormulaeArrayToTokens(
        data.formulaeArray,
        data.displayArray,
      );
      this.loadMaterialsForEdit(data.materialItems);
    } else {
      this.formulaId = null;
      this.expressionName = '';
      this.expressionTokens = [];
    }

    this.modal.show();
  }
  private loadMaterialsForEdit(savedItems: any[]): void {
  if (!this.selectedSupplierId) {
    this.materials = [];
    return;
  }

  const sub = this.commonService
    .GetAllMaterialBySupplierIdInFormula(this.selectedSupplierId)
    .subscribe({
      next: (res: any) => {

        const apiMaterials = res?.data ?? [];

        this.materials = apiMaterials.map((m: any) => {

          const matched = savedItems?.find(
            (x: any) => x.materialId === m.materialId
          );

          return {
            materialId: m.materialId,
            materialName: m.materialName,
            materialCode: m.materialCode,
            totalCost: matched?.totalCost ?? 0,
            marginPct: matched?.marginPct ?? 0,
            sellingPrice: matched?.sellingPrice ?? 0
          };
        });

      },
      error: () => {
        this.toast.error('Failed to load materials');
        this.materials = [];
      }
    });

  this.subs.push(sub);
}
 loadProducts() {

    this.commonService
      .getGetAllProductList()
      .subscribe(res => {

        if (res?.isSuccess) {

          this.products = res.data ?? [];

        }

      });

  }

  closeModal(): void {
    this.modal.hide();
    this.isvalidated = false;
    this.validatedResult = null;
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

  const sub = this.commonService
    .GetAllMaterialBySupplierIdInFormula(this.selectedSupplierId)
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
          totalCost: 0,
          sellingPrice: 0,
          marginPct: 0
        }));
      },
      error: () => {
        this.toast.error('Failed to load materials');
        this.materials = [];
      },
    });

  this.subs.push(sub);
}

calculateFromCost(material: any) {
  if (material.totalCost && material.marginPct != null) {
    material.sellingPrice =
      material.totalCost * (1 + material.marginPct / 100);
  }
}

calculateFromSelling(material: any) {
  if (material.totalCost && material.sellingPrice) {
    material.marginPct =
      ((material.sellingPrice - material.totalCost) / material.totalCost) * 100;
  }
}

calculateFromMargin(material: any) {
  if (material.totalCost && material.marginPct != null) {
    material.sellingPrice =
      material.totalCost * (1 + material.marginPct / 100);
  }
}

  private mapFormulaeArrayToTokens(
    formulaeArray: string[],
    displayArray: string[],
  ): string[] {
    return formulaeArray.map((item, index) => {
      if (!item.includes('__')) {
        return item;
      }

      const [, id] = item.split('__');

      const found = this.expressionItems.find((x) => x.id === id);

      return found ? found.displayName : displayArray[index];
    });
  }

  isOperator(token: string): boolean {
    return this.operators.some((o) => o.operatorDisplayName === token);
  }

  setInsertIndex(index: number): void {
    this.insertIndex = index;
  }

addToken(item: any): void {
  const token = {
    name: item.name,             
    displayName: item.displayName,
    id: item.id
  };

  if (this.insertIndex === null) {
    this.expressionTokens.push(token);
  } else {
    this.expressionTokens.splice(this.insertIndex++, 0, token);
  }
}


getDisplayName(token: any): string {
  if (typeof token === 'string') return token;
  return token?.displayName || '';
}
addNumber(value: string): void {
  if (!value) return;

  const token = {
    name: value,
    displayName: value,
    id: null
  };

  if (this.insertIndex === null) {
    this.expressionTokens.push(token);
  } else {
    this.expressionTokens.splice(this.insertIndex++, 0, token);
  }
}

  removeToken(index: number): void {
    this.expressionTokens.splice(index, 1);
    if (this.insertIndex !== null && this.insertIndex > index) {
      this.insertIndex--;
    }
  }

  clearAll(): void {
    this.expressionTokens = [];
    this.insertIndex = null;
  }


validateExpression(): void {
  if (!this.isvalidated) {
    this.toast.warning("Please validate formula first");
    return;
  }

  const payload = this.buildPayload();

  const api$ = this.isEdit
    ? this.supplierformulaService.updateformula({
        ...payload,
        formulaId: this.formulaId
      })
    : this.supplierformulaService.createformula(payload);

  api$.subscribe(res => {
    if (res.isSuccess) {
      this.toast.success(res.message);
      this.closeModal();
    } else {
      this.toast.error(res.message);
    }
  });
}

  /* ================= PAYLOAD BUILDER ================= */

private buildPayload() {
  const formulaeArray: string[] = [];
  const displayArray: string[] = [];

  this.expressionTokens.forEach((token) => {
    formulaeArray.push(`${token.name}__${token.id}`);
    displayArray.push(token.displayName);
  });

  return {
    supplierId: this.selectedSupplierId,
    formulaName: this.expressionName,
    productId: this.selectedProductId,

    formula: this.expressionTokens
  .map(t => this.isOperatorToken(t) ? t.displayName : t.name)
  .join(' '),

    formulaeArray,
    displayArray,
    formulaStatus: this.selectedStatus,

    materialItems: this.materials
      .filter(m => m.marginPct > 0)
      .map(m => ({
        materialId: m.materialId,
        totalCost: m.totalCost,
        marginPct: m.marginPct,
        sellingPrice: m.sellingPrice
      }))
  };
}
isOperatorToken(token: any): boolean {
  return token.name?.startsWith('operator__');
}
  private loadExpressionItems(): void {
    this.commonService.getGetAllOperatorsAndMaterialList().subscribe((res) => {
      this.expressionItems = res.data ?? [];
    });
  }

onValidate(): void {
  if (!this.expressionTokens.length) {
    this.toast.warning('Expression cannot be empty');
    return;
  }

  const formula = this.expressionTokens
    .map(t => t.name)
    .join(' ');

  this.supplierformulaService.validateformula({ formula })
    .subscribe(res => {
      if (res.isSuccess) {
        this.isvalidated = true;
        this.validatedResult = res.data;
        this.toast.success("Formula is valid");
      } else {
        this.isvalidated = false;
        this.toast.error(res.message);
      }
    });
}

private resetForm(): void {
  this.expressionName = '';
  this.expressionTokens = [];
  this.insertIndex = null;

  this.selectedSupplierId = null;
  this.selectedProductId = null;
  this.selectedStatus = 1;

  this.materials = [];

  this.isvalidated = false;
  this.validatedResult = null;
}
}
