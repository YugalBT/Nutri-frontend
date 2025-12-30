import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OperatorList, OperatorsAndRationsList } from '../../../core/models/operator-list';
import { RationList } from '../../../core/models/ration-list';
import { CommonService } from '../../../shared/services/common.service';
import { FormulaService } from '../../../core/services/formula/formula.service';
import { SharedModule } from '../../../shared/shared.module';
import { ToastService } from '../../../shared/services/toast.service';
import { TranslatePipe } from '../../../i18n/translate.pipe';

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

  modal: any;
  isEdit = false;
  formulaId: string | null = null;

  expressionName = '';
  expressionTokens: string[] = [];
  insertIndex: number | null = null;

  operators: OperatorList[] = [];
  rations: RationList[] = [];
  expressionItems: OperatorsAndRationsList[] = [];

  constructor(
    private commonService: CommonService,
    private formulaService: FormulaService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.modal = new bootstrap.Modal(this.expressionModal.nativeElement, { backdrop: 'static' });
    // this.loadOperators();
    // this.loadRations();
    this.loadExpressionItems();
  }

  /* ================= MODAL ================= */

 openModal(edit = false, data?: any): void {
  this.isEdit = edit;
  this.insertIndex = null;

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
    if (!this.expressionName.trim()) {
      this.toast.warning('Expression name is required');
      return;
    }

    if (!this.expressionTokens.length) {
      this.toast.warning('Expression cannot be empty');
      return;
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

    const found = this.expressionItems.find(
      x => x.displayName === token
    );

    if (found) {
      formulaeArray.push(`${token}__${found.id}`);
      displayArray.push(token);
      return;
    }

    // number
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
  this.commonService.getGetAllOperatorsAndRationsList().subscribe(res => {
    this.expressionItems = (res.data ?? []);
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
}
