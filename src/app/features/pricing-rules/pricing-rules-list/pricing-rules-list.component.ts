import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

import { TranslatePipe } from '../../../i18n/translate.pipe';
import { TranslateService } from '../../../i18n/translate.service';
import { PricingRulesService } from '../../../core/services/pricing-rules/pricing-rules.service';
import { PricingAttributeService } from '../../../core/services/pricing-rules/pricing-attribute.service';
import { ToastService } from '../../../shared/services/toast.service';
import { ConfirmDialogService } from '../../../shared/services/confirm-dialog.service';
import { PricingRule, CalculatedPriceVm } from '../../../core/models/pricing-rule';
import { PricingAttribute } from '../../../core/models/pricing-attribute';
import { PricingRulesAddEditComponent } from '../pricing-rules-add-edit/pricing-rules-add-edit.component';
import { PricingAttributeManagerComponent } from '../pricing-attribute-manager/pricing-attribute-manager.component';

@Component({
  selector: 'app-pricing-rules-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslatePipe,
    PricingRulesAddEditComponent,
    PricingAttributeManagerComponent,
  ],
  templateUrl: './pricing-rules-list.component.html',
  styleUrl: './pricing-rules-list.component.css',
})
export class PricingRulesListComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild('addEditModal')    addEditModal!: PricingRulesAddEditComponent;
  @ViewChild('attrManager')     attrManager!:  PricingAttributeManagerComponent;

  // ── Dynamic reference data (loaded from API) ──────────────────────────────
  categories: PricingAttribute[] = [];
  formats:    PricingAttribute[] = [];
  dosages:    PricingAttribute[] = [];

  // ── State ─────────────────────────────────────────────────────────────────
  selectedCategory = '';
  allRules: PricingRule[] = [];
  loading = false;

  // ── Calculator ────────────────────────────────────────────────────────────
  calcCategory = '';
  calcFormat   = '';
  calcDosage   = '';
  calcCost     = 200;
  calcResult: CalculatedPriceVm | null = null;
  calcLoading  = false;

  private destroy$ = new Subject<void>();

  constructor(
    private service:       PricingRulesService,
    private attrService:   PricingAttributeService,
    private toast:         ToastService,
    private confirmDialog: ConfirmDialogService,
    private translate:     TranslateService,
  ) {}

  ngOnInit(): void {
    // Bootstrap catalog first; start loading rules in parallel
    this.attrService.loadCatalog().pipe(takeUntil(this.destroy$)).subscribe();

    // Keep catalog arrays in sync whenever SuperAdmin changes attributes
    this.attrService.catalog$
      .pipe(takeUntil(this.destroy$))
      .subscribe((catalog) => {
        this.categories = catalog.categories.filter(c => c.isActive);
        this.formats    = catalog.formats.filter(f => f.isActive);
        this.dosages    = catalog.dosages.filter(d => d.isActive);

        // Initialise selected values to first item when not yet set
        if (!this.selectedCategory && this.categories.length) {
          this.selectedCategory = this.categories[0].name;
          this.calcCategory     = this.categories[0].name;
        }
        if (!this.calcFormat && this.formats.length) {
          this.calcFormat = this.formats[0].name;
        }
        if (!this.calcDosage && this.dosages.length) {
          this.calcDosage = this.dosages[0].name;
        }
      });

    this.loadRules();
    this.service.pricingRulesChanged$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.loadRules());

    // Refresh rules when attributes change (e.g. after rename)
    this.attrService.attributesChanged$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.loadRules());
  }

  ngAfterViewInit(): void {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Data loading ──────────────────────────────────────────────────────────

  loadRules(): void {
    this.loading = true;
    this.service
      .getAllPricingRules({ searchValue: '', pageNo: 1, recordPerPage: 1000, status: 2 })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.allRules = res.isSuccess ? (res.data ?? []) : [];
          this.loading  = false;
        },
        error: () => { this.loading = false; },
      });
  }

  // ── Computed views ────────────────────────────────────────────────────────

  /** All rules belonging to the currently selected category tab. */
  get currentRules(): PricingRule[] {
    return this.allRules.filter(r => r.category === this.selectedCategory);
  }

  /** Rules for a specific format (both format-level and dosage-level rows). */
  getFormatRows(format: string): PricingRule[] {
    return this.currentRules.filter(r => r.format === format);
  }

  /** True when at least one rule (any level) exists for this format. */
  hasFormatRules(format: string): boolean {
    return this.getFormatRows(format).length > 0;
  }

  /** Category-level default rule (format=null, dosage=null). */
  getCategoryRule(): PricingRule | undefined {
    return this.currentRules.find(r => r.format == null && r.dosage == null);
  }

  // ── Status helpers ────────────────────────────────────────────────────────

  getStatus(rule: PricingRule): 'Healthy' | 'Below Min' {
    return rule.targetMargin >= rule.minMargin ? 'Healthy' : 'Below Min';
  }

  getStatusClass(rule: PricingRule): string {
    return rule.targetMargin >= rule.minMargin ? 'status-healthy' : 'status-below';
  }

  isDosageMissing(format: string, dosage: string): boolean {
    return !this.currentRules.some(r => r.format === format && r.dosage === dosage);
  }

  // ── Navigation ────────────────────────────────────────────────────────────

  selectCategory(cat: string): void {
    this.selectedCategory = cat;
    this.calcCategory     = cat;
    this.calcResult       = null;
  }

  openAttrManager(): void {
    this.attrManager.open('Category');
  }

  // ── Modal openers ─────────────────────────────────────────────────────────

  openAddModal(): void {
    this.addEditModal.open(false, {
      category:     this.selectedCategory,
      format:       null,
      dosage:       null,
      targetMargin: 0,
      minMargin:    0,
      commissionPct: 0,
      formulaType:  'Standard',
      isActive:     true,
    } as Partial<PricingRule>);
  }

  openFormatModal(format: string): void {
    // Edit the format-level default rule; create one if it doesn't exist yet
    const existing = this.currentRules.find(r => r.format === format && r.dosage == null);
    if (existing) {
      this.addEditModal.open(true, existing);
    } else {
      this.addEditModal.open(false, {
        category:     this.selectedCategory,
        format,
        dosage:       null,
        targetMargin: 0,
        minMargin:    0,
        commissionPct: 0,
        formulaType:  'Standard',
        isActive:     true,
      } as Partial<PricingRule>);
    }
  }

  openEditModal(rule: PricingRule): void {
    this.addEditModal.open(true, rule);
  }

  openCategoryDefaultModal(): void {
    const existing = this.getCategoryRule();
    if (existing) {
      this.addEditModal.open(true, existing);
    } else {
      this.addEditModal.open(false, {
        category:     this.selectedCategory,
        format:       null,
        dosage:       null,
        targetMargin: 0,
        minMargin:    0,
        commissionPct: 0,
        formulaType:  'Standard',
        isActive:     true,
      } as Partial<PricingRule>);
    }
  }

  // ── Delete ────────────────────────────────────────────────────────────────

  deleteRule(id: string): void {
    this.confirmDialog
      .confirm(this.translate.instant('pricingRules.deleteRuleConfirm'))
      .subscribe((confirmed) => {
        if (!confirmed) return;
        this.service.deletePricingRule(id).subscribe({
          next: (res) => {
            if (res.isSuccess) {
              this.toast.success(res.message);
              this.loadRules();
            } else {
              this.toast.error(res.message);
            }
          },
        });
      });
  }

  /** Safe helper: delete the format-level default rule (dosage=null) for a format. */
  deleteFormatDefaultRule(fmt: string): void {
    const rule = this.currentRules.find(r => r.format === fmt && r.dosage == null);
    if (rule) this.deleteRule(rule.pricingRuleId);
  }

  /** Safe helper: delete the category-level default rule. */
  deleteCategoryDefaultRule(): void {
    const rule = this.getCategoryRule();
    if (rule) this.deleteRule(rule.pricingRuleId);
  }

  // ── Calculator ────────────────────────────────────────────────────────────

  calculate(): void {
    this.calcLoading = true;
    this.calcResult  = null;
    this.service
      .calculatePrice({
        category:    this.calcCategory,
        format:      this.calcFormat   || null,
        dosage:      this.calcDosage   || null,
        formulaCost: this.calcCost,
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res.isSuccess) this.calcResult = res.data;
          else this.toast.error(res.message);
          this.calcLoading = false;
        },
        error: () => { this.calcLoading = false; },
      });
  }

  resetChanges(): void {
    this.loadRules();
    this.calcResult = null;
    this.toast.success(this.translate.instant('pricingRules.resetSuccess'));
  }
}
