import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { FormulaService } from '../../../core/services/formula/formula.service';
import { SharedModule } from '../../../shared/shared.module';
import { ReusableTableComponent } from '../../../shared/components/reusable-table/reusable-table.component';
import { GlobalSearchComponent } from '../../../shared/components/global-search/global-search.component';
import { ToastService } from '../../../shared/services/toast.service';
import { ConfirmDialogService } from '../../../shared/services/confirm-dialog.service';
import { TranslatePipe } from '../../../i18n/translate.pipe';
import { TranslateService } from '../../../i18n/translate.service';
import { SupplierPricingFormulaAddEditComponent } from '../supplier-pricing-formula-add-edit/supplier-pricing-formula-add-edit.component';
import { ExpressionAddEditComponent } from '../../expression/expression-add-edit/expression-add-edit.component';
import { SupplierPricingFormulaService } from '../../../core/services/supplier/supplier-pricing-formula.service';
import { CommonService } from '../../../shared/services/common.service';
import { PERMISSIONS } from '../../../core/constants/permissions.constants';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-supplier-pricing-formula-list',
  standalone: true,
  imports: [
    SharedModule,
        CommonModule,
        ReusableTableComponent,
        GlobalSearchComponent,
        SupplierPricingFormulaAddEditComponent,
        TranslatePipe
  ],
  templateUrl: './supplier-pricing-formula-list.component.html',
  styleUrl: './supplier-pricing-formula-list.component.css'
})
export class SupplierPricingFormulaListComponent {
@ViewChild('expressionModal') expressionModal!: SupplierPricingFormulaAddEditComponent;

  // columns = ['Formula Name', 'Formula', 'Status'];

  // columnFields = ['formulaName', 'formula', 'isActive'];

  expressions: any[] = [];
  totalRecords = 0;
  pageSize = 10;
  pageIndex = 0;

  searchValue = '';
  filterStatus: number | null = 2;

  private subs: Subscription[] = [];

  columns: string[] = [];
  columnFields: string[] = [];
  private langSub: Subscription | undefined;
  canAddFormula = false;
  viewPermission = PERMISSIONS.PricingFormulaView;
  editPermission = PERMISSIONS.PricingFormulaEdit;
  deletePermission = PERMISSIONS.PricingFormulaDelete;

  constructor(
    private formulaService: SupplierPricingFormulaService,
    private toast: ToastService,
    private confirm: ConfirmDialogService,
    private translate: TranslateService,
    private commonService: CommonService
  ) { this.setColumns(),
    this.langSub = this.translate.lang$.subscribe(() => this.setColumns());
   }

  ngOnInit(): void {
    this.canAddFormula = this.commonService.checkPermission(PERMISSIONS.PricingFormulaAdd, false);
    if (!this.commonService.checkPermission(PERMISSIONS.PricingFormulaView, false)) {
      return;
    }
    this.loadExpressions(1, this.pageSize);

    const sub = this.formulaService.formulasChanged$
      .subscribe(() => {
        this.loadExpressions(this.pageIndex + 1, this.pageSize);
      });

    this.subs.push(sub);
  }

  /* ================= LOAD ================= */

  loadExpressions(pageNo: number, recordPerPage: number): void {
    const payload = {
      pageNo,
      recordPerPage,
      searchValue: this.searchValue || '',
      status: this.filterStatus
    };

    const sub = this.formulaService.getformulasDetails(payload)
      .subscribe({
        next: (res) => {
          this.expressions = res?.data ?? [];
          this.totalRecords = res?.totalRecords ?? 0;
        },
        error: () => this.expressions = []
      });

    this.subs.push(sub);
  }

  private setColumns() {
    this.columns = [
      this.translate.instant('formula.table.formulaName') ?? "Formula Name",
      this.translate.instant('formula.table.formula') ?? "Formula",
      this.translate.instant('formula.table.status') ?? "Status"
    ];

    this.columnFields = [
      'formulaName',
      'formula',
      'isActive'
    ];

  }

  /* ================= SEARCH / FILTER ================= */

  onSearch(value: string): void {
    this.searchValue = value;
    this.pageIndex = 0;
    this.loadExpressions(1, this.pageSize);
  }

  onStatusChange(status: number | null): void {
    this.filterStatus = status === null ? 2 : status;
    this.pageIndex = 0;
    this.expressions = [];
    this.loadExpressions(1, this.pageSize);
  }

  clearFilters(): void {
    this.searchValue = '';
    this.filterStatus = 2;
    this.pageIndex = 0;
    this.expressions = [];
    this.loadExpressions(1, this.pageSize);
  }

  onPageChange(event: { pageIndex: number; pageSize: number }): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadExpressions(this.pageIndex + 1, this.pageSize);
  }

  /* ================= EDIT ================= */

  onEdit(row: any): void {
    this.expressionModal.openModal(true, row);
  }

  /* ================= ACTIVE / INACTIVE ================= */

  onToggleActive(event: { row: any; isActive: boolean }): void {
    if (!this.commonService.checkPermission(PERMISSIONS.PricingFormulaEdit)) {
      return;
    }
    event.row.isToggling = true;

    const id = event?.row?.formulaId;
    if (!id) {
      this.toast.error('Invalid formula id');
      event.row.isToggling = false;
      return;
    }

    const sub = this.formulaService.activeInActive(id).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.toast.success(res.message);
          event.row.isActive = !event.row.isActive;
        } else {
          this.toast.error(res.message);
        }
      },
      error: (err) => this.toast.error(err?.error?.message),
      complete: () => event.row.isToggling = false
    });

    this.subs.push(sub);
  }

  /* ================= DELETE ================= */

  onDelete(row: any): void {
    if (!this.commonService.checkPermission(PERMISSIONS.PricingFormulaDelete)) {
      return;
    }
    const id = row?.formulaId;
    if (!id) {
      this.toast.error('Invalid formula id');
      return;
    }

    this.confirm.confirm('Are you sure you want to delete this expression?')
      .subscribe((confirmed) => {
        if (!confirmed) return;

        const sub = this.formulaService.deleteformula(id).subscribe({
          next: (res) => {
            res.isSuccess
              ? this.toast.success(res.message)
              : this.toast.error(res.message);
          },
          error: (err) => this.toast.error(err?.error?.message)
        });

        this.subs.push(sub);
      });
  }

  /* ================= CLEANUP ================= */

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }
}

