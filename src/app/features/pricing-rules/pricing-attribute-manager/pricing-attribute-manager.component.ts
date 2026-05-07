import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

import { TranslatePipe } from '../../../i18n/translate.pipe';
import { TranslateService } from '../../../i18n/translate.service';
import { PricingAttributeService } from '../../../core/services/pricing-rules/pricing-attribute.service';
import { ToastService } from '../../../shared/services/toast.service';
import { ConfirmDialogService } from '../../../shared/services/confirm-dialog.service';
import { PricingAttribute, AttributeType, FormulaType } from '../../../core/models/pricing-attribute';

declare var bootstrap: any;

type ActiveTab = AttributeType | 'FormulaType';

interface EditingRow {
  id: string;
  name: string;
  sortOrder: number;
  // Formula type extras (only populated when editing a formula type)
  description:  string | null;
  costDivisor:  number;
}

@Component({
  selector: 'app-pricing-attribute-manager',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './pricing-attribute-manager.component.html',
  styleUrl: './pricing-attribute-manager.component.css',
})
export class PricingAttributeManagerComponent implements OnInit, AfterViewInit {

  @ViewChild('attrModal') modalEl!: ElementRef;

  activeTab: ActiveTab = 'Category';

  categories:   PricingAttribute[] = [];
  formats:      PricingAttribute[] = [];
  dosages:      PricingAttribute[] = [];
  types:        PricingAttribute[] = [];
  formulaTypes: FormulaType[]      = [];

  // New-item inline form state per tab
  newName:        string      = '';
  newSortOrder:   number      = 0;
  newDescription: string      = '';
  newCostDivisor: number      = 1.0;
  addingNew       = false;

  // Inline-edit state
  editing: EditingRow | null = null;

  saving = false;

  /** True when the Formula Types tab is active */
  get isFormulaTab(): boolean { return this.activeTab === 'FormulaType'; }

  private modalInstance: any;
  private destroy$ = new Subject<void>();

  constructor(
    private attrService:  PricingAttributeService,
    private toast:        ToastService,
    private confirmDialog: ConfirmDialogService,
    private translate:    TranslateService,
  ) {}

  // ── Translated label helpers ──────────────────────────────────────────────

  get emptyStateLabel(): string {
    const keyMap: Record<ActiveTab, string> = {
      Category:    'pricingAttrManager.emptyCategoryState',
      Format:      'pricingAttrManager.emptyFormatState',
      Dosage:      'pricingAttrManager.emptyDosageState',
      Type:        'pricingAttrManager.emptyTypeState',
      FormulaType: 'pricingAttrManager.emptyFormulaTypeState',
    };
    return this.translate.instant(keyMap[this.activeTab]);
  }

  get addButtonLabel(): string {
    const keyMap: Record<ActiveTab, string> = {
      Category:    'pricingAttrManager.addCategory',
      Format:      'pricingAttrManager.addFormat',
      Dosage:      'pricingAttrManager.addDosage',
      Type:        'pricingAttrManager.addType',
      FormulaType: 'pricingAttrManager.addFormulaType',
    };
    return this.translate.instant(keyMap[this.activeTab]);
  }

  get newNamePlaceholder(): string {
    const keyMap: Record<ActiveTab, string> = {
      Category:    'pricingAttrManager.newCategoryName',
      Format:      'pricingAttrManager.newFormatName',
      Dosage:      'pricingAttrManager.newDosageName',
      Type:        'pricingAttrManager.newTypeName',
      FormulaType: 'pricingAttrManager.newFormulaTypeName',
    };
    return this.translate.instant(keyMap[this.activeTab]);
  }

  ngOnInit(): void {
    this.attrService.catalog$
      .pipe(takeUntil(this.destroy$))
      .subscribe((catalog) => {
        this.categories   = catalog.categories;
        this.formats      = catalog.formats;
        this.dosages      = catalog.dosages;
        this.formulaTypes = catalog.formulaTypes;
      });
  }

  ngAfterViewInit(): void {
    this.modalInstance = new bootstrap.Modal(this.modalEl.nativeElement, {
      backdrop: 'static',
      keyboard: false,
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Open / Close ──────────────────────────────────────────────────────────

  open(tab: ActiveTab = 'Category'): void {
    this.activeTab = tab;
    this.resetNewForm();
    this.editing = null;
    this.modalInstance.show();
  }

  close(): void {
    this.modalInstance.hide();
    this.attrService.notifyChanged();
  }

  // ── Tab helpers ───────────────────────────────────────────────────────────

  get currentList(): PricingAttribute[] {
    switch (this.activeTab) {
      case 'Category': return this.categories;
      case 'Format':   return this.formats;
      case 'Dosage':   return this.dosages;
      case 'Type':     return this.types;
      default:         return [];   // FormulaType uses formulaTypes[]
    }
  }

  setTab(tab: ActiveTab): void {
    this.activeTab = tab;
    this.resetNewForm();
    this.editing = null;
  }

  // ── Add new ───────────────────────────────────────────────────────────────

  resetNewForm(): void {
    this.newName        = '';
    this.newDescription = '';
    this.newCostDivisor = 1.0;
    this.newSortOrder   = this.isFormulaTab
      ? this.formulaTypes.length * 10
      : this.currentList.length * 10;
    this.addingNew = false;
  }

  startAdding(): void {
    this.editing        = null;
    this.newName        = '';
    this.newDescription = '';
    this.newCostDivisor = 1.0;
    this.newSortOrder   = this.isFormulaTab
      ? this.formulaTypes.length * 10
      : this.currentList.length * 10;
    this.addingNew = true;
  }

  saveNew(): void {
    const name = this.newName.trim();
    if (!name) return;

    this.saving = true;

    if (this.isFormulaTab) {
      this.attrService.createFormulaType({
        name,
        description:  this.newDescription.trim() || null,
        costDivisor:  this.newCostDivisor,
        sortOrder:    this.newSortOrder,
      }).subscribe({
        next: (res) => {
          if (res.isSuccess) { this.toast.success(res.message); this.reloadCatalog(); this.resetNewForm(); }
          else { this.toast.error(res.message); }
          this.saving = false;
        },
        error: () => { this.saving = false; },
      });
    } else {
      this.attrService.createAttribute({
        attributeType: this.activeTab as AttributeType,
        name,
        sortOrder: this.newSortOrder,
      }).subscribe({
        next: (res) => {
          if (res.isSuccess) { this.toast.success(res.message); this.reloadCatalog(); this.resetNewForm(); }
          else { this.toast.error(res.message); }
          this.saving = false;
        },
        error: () => { this.saving = false; },
      });
    }
  }

  // ── Inline edit ───────────────────────────────────────────────────────────

  startEdit(attr: PricingAttribute): void {
    this.addingNew = false;
    this.editing = {
      id:          attr.pricingAttributeId,
      name:        attr.name,
      sortOrder:   attr.sortOrder,
      description: null,
      costDivisor: 1.0,
    };
  }

  startEditFormula(ft: FormulaType): void {
    this.addingNew = false;
    this.editing = {
      id:          ft.formulaTypeId,
      name:        ft.name,
      sortOrder:   ft.sortOrder,
      description: ft.description,
      costDivisor: ft.costDivisor,
    };
  }

  cancelEdit(): void {
    this.editing = null;
  }

  saveEdit(): void {
    if (!this.editing || !this.editing.name.trim()) return;

    this.saving = true;

    if (this.isFormulaTab) {
      this.attrService.updateFormulaType({
        formulaTypeId: this.editing.id,
        name:          this.editing.name.trim(),
        description:   this.editing.description?.trim() || null,
        costDivisor:   this.editing.costDivisor,
        sortOrder:     this.editing.sortOrder,
      }).subscribe({
        next: (res) => {
          if (res.isSuccess) { this.toast.success(res.message); this.reloadCatalog(); this.editing = null; }
          else { this.toast.error(res.message); }
          this.saving = false;
        },
        error: () => { this.saving = false; },
      });
    } else {
      this.attrService.updateAttribute({
        pricingAttributeId: this.editing.id,
        name:               this.editing.name.trim(),
        sortOrder:          this.editing.sortOrder,
      }).subscribe({
        next: (res) => {
          if (res.isSuccess) { this.toast.success(res.message); this.reloadCatalog(); this.editing = null; }
          else { this.toast.error(res.message); }
          this.saving = false;
        },
        error: () => { this.saving = false; },
      });
    }
  }

  // ── Delete ────────────────────────────────────────────────────────────────

  delete(attr: PricingAttribute): void {
    const msg = this.translate
      .instant('pricingAttrManager.deleteConfirm')
      .replace('{name}', attr.name);
    this.confirmDialog.confirm(msg).subscribe((confirmed) => {
      if (!confirmed) return;
      this.attrService.deleteAttribute(attr.pricingAttributeId).subscribe({
        next: (res) => {
          if (res.isSuccess) { this.toast.success(res.message); this.reloadCatalog(); }
          else { this.toast.error(res.message); }
        },
      });
    });
  }

  deleteFormulaType(ft: FormulaType): void {
    const msg = this.translate
      .instant('pricingAttrManager.deleteConfirm')
      .replace('{name}', ft.name);
    this.confirmDialog.confirm(msg).subscribe((confirmed) => {
      if (!confirmed) return;
      this.attrService.deleteFormulaType(ft.formulaTypeId).subscribe({
        next: (res) => {
          if (res.isSuccess) { this.toast.success(res.message); this.reloadCatalog(); }
          else { this.toast.error(res.message); }
        },
      });
    });
  }

  // ── Toggle active ─────────────────────────────────────────────────────────

  toggleActive(attr: PricingAttribute): void {
    this.attrService.activeInActive(attr.pricingAttributeId).subscribe({
      next: (res) => {
        if (res.isSuccess) { this.toast.success(res.message); this.reloadCatalog(); }
        else { this.toast.error(res.message); }
      },
    });
  }

  toggleActiveFormulaType(ft: FormulaType): void {
    this.attrService.activeInActiveFormulaType(ft.formulaTypeId).subscribe({
      next: (res) => {
        if (res.isSuccess) { this.toast.success(res.message); this.reloadCatalog(); }
        else { this.toast.error(res.message); }
      },
    });
  }

  // ── Reload ────────────────────────────────────────────────────────────────

  private reloadCatalog(): void {
    this.attrService.loadCatalog().subscribe();
  }
}
