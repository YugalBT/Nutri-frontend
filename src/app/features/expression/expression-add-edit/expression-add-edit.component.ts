import { Component, ElementRef, Input, ViewChild, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OperatorList, OperatorsAndRationsList } from '../../../core/models/operator-list';
import { RationList } from '../../../core/models/ration-list';
import { CommonService } from '../../../shared/services/common.service';
import { FormulaService } from '../../../core/services/formula/formula.service';
import { SharedModule } from '../../../shared/shared.module';
import { ToastService } from '../../../shared/services/toast.service';
import { TranslatePipe } from '../../../i18n/translate.pipe';
import { PERMISSIONS } from '../../../core/constants/permissions.constants';

declare var bootstrap: any;

@Component({
  selector: 'app-expression-add-edit',
  standalone: true,
  imports: [SharedModule, FormsModule,TranslatePipe],
  templateUrl: './expression-add-edit.component.html',
  styleUrl: './expression-add-edit.component.css'
})
export class ExpressionAddEditComponent implements OnInit {

  @ViewChild('expressionModal', { static: true }) expressionModal!: ElementRef;

  /**
   * 'formula'  → regular nutritional formula builder (calls GetAllOperatorAndRation)
   * 'kpi'      → Super Admin KPI formula builder (calls GetDashboardKpiVariables)
   * Default is 'formula' so existing usage is unchanged.
   */
  @Input() context: 'formula' | 'kpi' = 'formula';

  modal: any;
  isEdit = false;
  canSave = false;
  formulaId: string | null = null;

  expressionName = '';
  expressionTokens: string[] = [];
  insertIndex: number | null = null;

  operators: OperatorList[] = [];
  rations: RationList[] = [];
  expressionItems: OperatorsAndRationsList[] = [];
  isvalidated: boolean = false;
  validatedResult: string | null = null;
  constructor(
    private commonService: CommonService,
    private formulaService: FormulaService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.modal = new bootstrap.Modal(this.expressionModal.nativeElement, { backdrop: 'static' });
  }

  /* ================= MODAL ================= */

 openModal(edit = false, data?: any): void {
  this.loadExpressionItems();
  this.isEdit = edit;
  this.canSave = edit
    ? this.commonService.checkPermission(PERMISSIONS.formulasEdit, false)
    : this.commonService.checkPermission(PERMISSIONS.FormulaAdd, false);
  if (!this.canSave) {
    this.toast.warning('No permission');
    return;
  }

  this.insertIndex = null;
  this.isvalidated = false;
  this.validatedResult = null;

  if (edit && data) {
    this.formulaId = data.formulaId;
    this.expressionName = data.formulaName;

    this.expressionTokens = this.mapFormulaeArrayToTokens(
      data.formulaeArray,
      data.displayArray
    );
  } else {
    this.formulaId = null;
    this.expressionName = '';
    this.expressionTokens = [];
  }

  this.modal.show();
}




  closeModal(): void {
    this.modal.hide();
      this.isvalidated = false;
  this.validatedResult = null;
  }


  /* ================= TOKEN HELPERS ================= */

  private mapFormulaeArrayToTokens(
  formulaeArray: string[],
  displayArray: string[]
): string[] {

  return formulaeArray.map((item, index) => {

    // NUMBER
    if (!item.includes('__')) {
      return item;
    }

    const [, id] = item.split('__');

    const found = this.expressionItems.find(x => x.id === id);

    return found ? found.displayName : displayArray[index];
  });
}

// private buildTokensFromFormulaeArray(
//   formulaeArray: string[],
//   displayArray: string[]
// ): string[] {

//   const tokens: string[] = [];

//   formulaeArray.forEach((item, index) => {

//     // NUMBER
//     if (!item.includes('__')) {
//       tokens.push(item);
//       return;
//     }

//     const [left, right] = item.split('__');

//     //  OPERATOR (symbol__operatorId)
//     const operator = this.operators.find(
//       o => o.operatorId === right
//     );

//     if (operator) {
//       tokens.push(operator.operatorDisplayName);
//       return;
//     }

//     // RATION (rationName__rationId)
//     const ration = this.rations.find(
//       r => r.rationId === right
//     );

//     if (ration) {
//       tokens.push(ration.rationName);
//       return;
//     }

//     // SAFE FALLBACK (never blank)
//     tokens.push(displayArray[index]);
//   });

//   return tokens;
// }


  isOperator(token: string): boolean {
    return this.operators.some(o => o.operatorDisplayName === token);
  }

  setInsertIndex(index: number): void {
    this.insertIndex = index;
  }

  addToken(value: string): void {
    this.insertIndex === null
      ? this.expressionTokens.push(value)
      : this.expressionTokens.splice(this.insertIndex++, 0, value);
  }

  addNumber(value: string): void {
    if (!value) return;
    this.addToken(value);
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

  /* ================= SAVE ================= */

  validateExpression(): void {
    const hasPermission = this.isEdit
      ? this.commonService.checkPermission(PERMISSIONS.formulasEdit)
      : this.commonService.checkPermission(PERMISSIONS.FormulaAdd);
    if (!hasPermission) return;

    if (!this.expressionName.trim()) {
      this.toast.warning('Expression name is required');
      return;
    }

    if (!this.expressionTokens.length) {
      this.toast.warning('Expression cannot be empty');
      return;
    }

    const validatePayload = {
      formula: this.expressionTokens.join(' ')
    };
    if (this.context !== 'kpi') {
    this.formulaService.validateformula(validatePayload).subscribe(res => {
      if (!res.isSuccess) {
        this.toast.error(res.message);
        return;
      }
    });
  }

    const payload = this.buildPayload();

    const api$ = this.isEdit
      ? this.formulaService.updateformula({ ...payload, formulaId: this.formulaId })
      : this.formulaService.createformula(payload);

    api$.subscribe(res => {
      res.isSuccess
        ? this.toast.success(res.message)
        : this.toast.error(res.message);

      if (res.isSuccess) this.closeModal();
    });
  }

  /* ================= PAYLOAD BUILDER ================= */

 private buildPayload() {

  const formulaeArray: string[] = [];
  const displayArray: string[] = [];

  this.expressionTokens.forEach(token => {

    // KPI context: economic variables all share Guid.Empty as id, so storing
    // token__guid would make editing impossible (all map to same id).
    // Store plain display names — NCalc evaluates the `formula` string directly
    // so no guid suffix is needed for KPI formulas.
    if (this.context === 'kpi') {
      formulaeArray.push(token);
      displayArray.push(token);
      return;
    }

    // Normal nutritional formula context — use existing guid-based storage
    const found = this.expressionItems.find(
      x => x.displayName === token
    );

    if (found) {
      formulaeArray.push(`${token}__${found.id}`);
      displayArray.push(token);
      return;
    }

    // plain number
    formulaeArray.push(token);
    displayArray.push(token);
  });

  return {
    formulaName: this.expressionName,
    formula: displayArray.join(' '),
    formulaeArray,
    displayArray
  };
}



  /* ================= API ================= */
private loadExpressionItems(): void {
  // Route to the correct API based on context:
  // 'kpi'     → economic dashboard variables only (Super Admin KPI builder)
  // 'formula' → existing nutritional formula variables (unchanged behavior)
  const source$ = this.context === 'kpi'
    ? this.commonService.getDashboardKpiVariables()
    : this.commonService.getGetAllOperatorsAndRationsList();

  source$.subscribe(res => {
    this.expressionItems = res.data ?? [];
  });
}
  // private loadOperators(): void {
  //   this.commonService.getGetAllOperatorList().subscribe(res => {
  //     this.operators = (res.data ?? []).filter(o => o.isActive);
  //   });
  // }

  // private loadRations(): void {
  //   this.commonService.getGetAllRationList().subscribe(res => {
  //     this.rations = (res.data ?? []).filter(r => r.isActive);
  //   });
  // }
onValidate(): void {

  if (!this.expressionName.trim()) {
    this.toast.warning('Expression name is required');
    return;
  }

  if (!this.expressionTokens.length) {
    this.toast.warning('Expression cannot be empty');
    return;
  }

  const formula = this.expressionTokens.join(' ');

  // KPI context → backend validator doesn't know economic variables,
  // so validate client-side by substituting 1 for every identifier
  if (this.context === 'kpi') {
    try {
      const testFormula = formula.replace(/[A-Za-z_][A-Za-z0-9_]*/g, '1');
      const result = Function(`"use strict"; return (${testFormula})`)();
      this.validatedResult = String(result);
      this.isvalidated = true;
      this.toast.success('KPI formula is valid');
    } catch {
      this.toast.error('Invalid KPI formula — check syntax');
      this.isvalidated = false;
    }
    return;
  }

  // ✅ Existing flow (formula context)
  const validatePayload = { formula };

  this.formulaService.validateformula(validatePayload).subscribe(res => {
    if (res.isSuccess) {
      this.toast.success(res.message);
      this.validatedResult = res.data ?? null;
      this.isvalidated = true;
    } else {
      this.toast.error(res.message);
      this.isvalidated = false;
    }
  });
}


// onSave(): void {
//   if (!this.expressionName.trim()) {
//     this.toast.warning('Expression name is required');
//     return;
//   }

//   if (!this.expressionTokens.length) {
//     this.toast.warning('Expression cannot be empty');
//     return;
//   }

//   const validatePayload = {
//     formula: this.expressionTokens.join(' ')
//   };

//   // STEP 1: Validate first
//   this.formulaService.validateformula(validatePayload).subscribe(res => {
//     if (!res.isSuccess) {
//       this.toast.error(res.message);
//       return;
//     }

//     // STEP 2: Build payload
//     const payload = this.buildPayload();

//     const api$ = this.isEdit
//       ? this.formulaService.updateformula({
//           ...payload,
//           formulaId: this.formulaId
//         })
//       : this.formulaService.createformula(payload);

//     // STEP 3: Save
//     api$.subscribe(saveRes => {
//       saveRes.isSuccess
//         ? this.toast.success(saveRes.message)
//         : this.toast.error(saveRes.message);

//       if (saveRes.isSuccess) {
//         this.closeModal();
//       }
//     });
//   });
// }

  
}
