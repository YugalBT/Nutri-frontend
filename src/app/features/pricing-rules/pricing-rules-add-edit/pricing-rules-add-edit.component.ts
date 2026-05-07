import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

import { TranslatePipe } from '../../../i18n/translate.pipe';
import { TranslateService } from '../../../i18n/translate.service';
import { PricingRulesService } from '../../../core/services/pricing-rules/pricing-rules.service';
import { PricingAttributeService } from '../../../core/services/pricing-rules/pricing-attribute.service';
import { ToastService } from '../../../shared/services/toast.service';
import { PricingRule } from '../../../core/models/pricing-rule';
import { PricingAttribute, FormulaType } from '../../../core/models/pricing-attribute';

declare var bootstrap: any;

@Component({
  selector: 'app-pricing-rules-add-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './pricing-rules-add-edit.component.html',
  styleUrl: './pricing-rules-add-edit.component.css',
})
export class PricingRulesAddEditComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild('prModal') modalEl!: ElementRef;

  // ── Dynamic reference data ────────────────────────────────────────────────
  categories:   PricingAttribute[] = [];
  formats:      PricingAttribute[] = [];
  dosages:      PricingAttribute[] = [];
  formulaTypes: FormulaType[]      = [];

  // ── State ─────────────────────────────────────────────────────────────────
  form!: FormGroup;
  isEdit   = false;
  loading  = false;

  private modalInstance: any;
  private destroy$ = new Subject<void>();

  constructor(
    private fb:          FormBuilder,
    private service:     PricingRulesService,
    private attrService: PricingAttributeService,
    private toast:       ToastService,
    private translate:   TranslateService,
  ) {}

  ngOnInit(): void {
    this.buildForm();

    // Stay in sync with the shared attribute catalog
    this.attrService.catalog$
      .pipe(takeUntil(this.destroy$))
      .subscribe((catalog) => {
        this.categories   = catalog.categories.filter(c => c.isActive);
        this.formats      = catalog.formats.filter(f => f.isActive);
        this.dosages      = catalog.dosages.filter(d => d.isActive);
        this.formulaTypes = catalog.formulaTypes.filter(ft => ft.isActive);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngAfterViewInit(): void {
    this.modalInstance = new bootstrap.Modal(this.modalEl.nativeElement, {
      backdrop: 'static',
      keyboard: false,
    });
  }

  // ── Form ──────────────────────────────────────────────────────────────────

  private buildForm(): void {
    this.form = this.fb.group({
      pricingRuleId: [null],
      category:      ['',       Validators.required],
      format:        [null],
      dosage:        [null],
      targetMargin:  [null,     [Validators.required, Validators.min(0), Validators.max(100)]],
      minMargin:     [null,     [Validators.required, Validators.min(0), Validators.max(100)]],
      commissionPct: [null,     [Validators.required, Validators.min(0), Validators.max(100)]],
      formulaType:   ['Standard', Validators.required],
      isActive:      [true],
    });
  }

  // ── Open / Close ──────────────────────────────────────────────────────────

  open(isEdit: boolean, data?: Partial<PricingRule>): void {
    this.isEdit = isEdit;
    const defaultFormula = this.formulaTypes[0]?.name ?? '';
    this.form.reset({ formulaType: defaultFormula, isActive: true });

    if (data) {
      this.form.patchValue({
        pricingRuleId: (data as any).pricingRuleId ?? null,
        category:      data.category      ?? '',
        format:        data.format        ?? null,
        dosage:        data.dosage        ?? null,
        targetMargin:  data.targetMargin  ?? null,
        minMargin:     data.minMargin     ?? null,
        commissionPct: data.commissionPct ?? null,
        formulaType:   data.formulaType   ?? defaultFormula,
        isActive:      data.isActive      ?? true,
      });
    }

    this.modalInstance.show();
  }

  close(): void {
    this.modalInstance.hide();
  }

  // ── Derived UI helpers ────────────────────────────────────────────────────

  get ruleLevelLabel(): string {
    const f = this.form.get('format')?.value;
    const d = this.form.get('dosage')?.value;
    if (!f)      return this.translate.instant('pricingRules.levelCategoryDefault');
    if (f && !d) return this.translate.instant('pricingRules.levelFormatDefault');
    return this.translate.instant('pricingRules.levelDosageSpecific');
  }

  get ruleLevelClass(): string {
    const f = this.form.get('format')?.value;
    const d = this.form.get('dosage')?.value;
    if (!f)        return 'level-category';
    if (f && !d)   return 'level-format';
    return 'level-dosage';
  }

  trackFormulaType(_: number, ft: FormulaType): string {
    return ft.formulaTypeId;
  }

  isInvalid(field: string): boolean {
    const c = this.form.get(field);
    return !!(c?.invalid && c?.touched);
  }

  // ── Save ──────────────────────────────────────────────────────────────────

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    const raw = this.form.value;

    // Coerce empty strings → null for nullable fields
    const payload = {
      ...raw,
      format: raw.format  || null,
      dosage: raw.dosage  || null,
    };

    const call$ = this.isEdit
      ? this.service.updatePricingRule(payload)
      : this.service.createPricingRule(payload);

    call$.subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.toast.success(res.message);
          this.service.notifyPricingRulesChanged();
          this.close();
        } else {
          this.toast.error(res.message);
        }
        this.loading = false;
      },
      error: () => { this.loading = false; },
    });
  }
}
