import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, AbstractControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { SharedModule } from '../../../shared/shared.module';
import { ToastService } from '../../../shared/services/toast.service';
import { CommonService } from '../../../shared/services/common.service';
import { KpiService } from '../../../core/services/day/kpi.service';
import { ApiResponse } from '../../../core/models/api-response';
import { PERMISSIONS } from '../../../core/constants/permissions.constants';
import { FormulaList } from '../../../core/models/formula-list';
import { TranslatePipe } from '../../../i18n/translate.pipe';

declare var bootstrap: any;

@Component({
  selector: 'app-kpi-add-edit',
  standalone: true,
  imports: [SharedModule, TranslatePipe],
  templateUrl: './kpi-add-edit.component.html',
  styleUrl: './kpi-add-edit.component.css'
})
export class KpiAddEditComponent implements OnInit, OnDestroy {

  @ViewChild('kpiModal') kpiModal!: ElementRef;

  form!: FormGroup;
  modalInstance: any;

  isEdit = false;
  canSave = false;
  currentKpiId: string | null = null;

  formula: FormulaList[] = [];
  formulasLoading = false;

  subs: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private toast: ToastService,
    private commonService: CommonService,
    private kpiService: KpiService
  ) { }

  ngOnInit() {
    this.initializeForm();
    this.loadFormulaList();
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
  }

  // ─── Static option lists ──────────────────────────────────────────────────

  readonly displayTypeOptions = [
    { value: 'card',       label: 'Card (numeric display)' },
    { value: 'gauge',      label: 'Gauge (dial chart)' },
    { value: 'chart_line', label: 'Line Chart (trend)' },
    { value: 'chart_bar',  label: 'Bar Chart (comparison)' },
  ];

  readonly displayLocationOptions = [
    { value: 'company', label: 'Company Dashboard only' },
    { value: 'admin',   label: 'Admin Dashboard only' },
    { value: 'both',    label: 'Both Dashboards' },
  ];

  readonly sectionColorOptions = [
    { value: '',                label: '— None (standalone card) —' },
    { value: 'tone-feed',       label: '🟢 Green  (Feeding)' },
    { value: 'tone-herd',       label: '🟠 Peach  (Herd)' },
    { value: 'tone-production', label: '🔵 Blue   (Production)' },
    { value: 'tone-fertility',  label: '🌸 Pink   (Fertility)' },
  ];

  // ─── Form helpers ─────────────────────────────────────────────────────────

  get kpiType(): string {
    return this.form.get('kpiType')?.value ?? 'single';
  }

  get labels(): FormArray {
    return this.form.get('labels') as FormArray;
  }

  private buildLabelGroup(data?: any): FormGroup {
    return this.fb.group({
      labelId:     [data?.labelId     ?? null],
      labelNameEn: [data?.labelNameEn ?? '', [Validators.required, Validators.maxLength(100)]],
      labelNameIt: [data?.labelNameIt ?? '', Validators.maxLength(100)],
      formulaId:   [data?.formulaId   ?? null, Validators.required],
      sortOrder:   [data?.sortOrder   ?? 0],
    });
  }

  addLabel(): void {
    this.labels.push(this.buildLabelGroup());
  }

  removeLabel(index: number): void {
    this.labels.removeAt(index);
  }

  // ─── Form initialisation ─────────────────────────────────────────────────

  private initializeForm() {
    this.form = this.fb.group({
      kpiType:         ['single'],
      kpiname:         ['', [Validators.required, Validators.maxLength(50)]],
      kpinameIt:       ['', Validators.maxLength(50)],
      displayType:     ['card', Validators.required],
      displayLocation: ['company', Validators.required],
      gaugeMin:        [0],
      gaugeMax:        [100],
      sortOrder:       [0],
      sectionName:     [''],
      sectionNameIt:   [''],
      sectionColor:    [''],
      // Single-value
      formulaId:       [null],
      // Multi-label
      labels:          this.fb.array([]),
    });
  }

  private resetForm() {
    // Clear label rows
    while (this.labels.length) this.labels.removeAt(0);

    this.form.reset({
      kpiType:         'single',
      kpiname:         '',
      kpinameIt:       '',
      displayType:     'card',
      displayLocation: 'company',
      gaugeMin:        0,
      gaugeMax:        100,
      sortOrder:       0,
      sectionName:     '',
      sectionNameIt:   '',
      sectionColor:    '',
      formulaId:       null,
    });
  }

  // ─── Validation helpers ───────────────────────────────────────────────────

  isFormValid(): boolean {
    if (this.kpiType === 'single') {
      return !!(this.form.get('kpiname')?.valid && this.form.get('formulaId')?.value);
    }
    // multi: card name required + at least one valid label row
    return !!(this.form.get('kpiname')?.valid && this.labels.length > 0 && this.labels.valid);
  }

  // ─── API ─────────────────────────────────────────────────────────────────

  private loadFormulaList() {
    this.formulasLoading = true;
    const sub = this.commonService.getFormulaList().subscribe({
      next: (res: ApiResponse<any>) => {
        this.formula = Array.isArray(res?.data) ? res.data : [];
        this.formulasLoading = false;
      },
      error: (err: ApiResponse<any>) => {
        this.formulasLoading = false;
        this.formula = [];
        this.toast.error(err.message);
      }
    });
    this.subs.push(sub);
  }

  openModal(edit = false, data?: any) {
    this.isEdit = edit;
    this.canSave = edit
      ? this.commonService.checkPermission(PERMISSIONS.KpiEdit, false)
      : this.commonService.checkPermission(PERMISSIONS.KpiAdd, false);
    if (!this.canSave) {
      this.toast.warning('No permission');
      return;
    }

    this.resetForm();

    if (edit && data) {
      this.currentKpiId = data.kpiid;

      // Clear label rows and rebuild from saved data
      while (this.labels.length) this.labels.removeAt(0);
      if (data.kpiType === 'multi' && Array.isArray(data.labels)) {
        data.labels.forEach((lbl: any) => this.labels.push(this.buildLabelGroup(lbl)));
      }

      this.form.patchValue({
        kpiType:         data.kpiType         ?? 'single',
        kpiname:         data.kpiname         ?? '',
        kpinameIt:       data.kpinameIt       ?? '',
        formulaId:       data.formulaId       ?? null,
        displayType:     data.displayType     ?? 'card',
        displayLocation: data.displayLocation ?? 'company',
        gaugeMin:        data.gaugeMin        ?? 0,
        gaugeMax:        data.gaugeMax        ?? 100,
        sortOrder:       data.sortOrder       ?? 0,
        sectionName:     data.sectionName     ?? '',
        sectionNameIt:   data.sectionNameIt   ?? '',
        sectionColor:    data.sectionColor    ?? '',
      });
    } else {
      this.currentKpiId = null;
    }

    this.modalInstance = new bootstrap.Modal(this.kpiModal.nativeElement);
    this.modalInstance.show();
  }

  closeModal() {
    this.modalInstance?.hide();
  }

  savekpi() {
    const hasPermission = this.isEdit
      ? this.commonService.checkPermission(PERMISSIONS.KpiEdit)
      : this.commonService.checkPermission(PERMISSIONS.KpiAdd);
    if (!hasPermission) return;

    if (!this.isFormValid()) {
      this.toast.warning('Please fill all required fields');
      return;
    }

    const raw = this.form.value;
    const isMulti = raw.kpiType === 'multi';

    const payload: any = {
      kpiType:         raw.kpiType,
      kpiname:         raw.kpiname,
      kpinameIt:       raw.kpinameIt     || null,
      displayType:     raw.displayType   ?? 'card',
      displayLocation: raw.displayLocation ?? 'company',
      gaugeMin:        raw.gaugeMin  != null ? Number(raw.gaugeMin)  : 0,
      gaugeMax:        raw.gaugeMax  != null ? Number(raw.gaugeMax)  : 100,
      sortOrder:       raw.sortOrder != null ? Number(raw.sortOrder) : 0,
      sectionName:     raw.sectionName   || null,
      sectionNameIt:   raw.sectionNameIt || null,
      sectionColor:    raw.sectionColor  || null,
      // Single-value: send formulaId; multi: backend ignores it
      formulaId:       isMulti ? null : (raw.formulaId || null),
      // Multi-label: send label rows with sortOrder derived from array position
      labels: isMulti
        ? (raw.labels ?? []).map((lbl: any, i: number) => ({
            ...lbl,
            sortOrder:   i,
            labelNameIt: lbl.labelNameIt || null,
          }))
        : [],
    };

    if (this.isEdit && this.currentKpiId) {
      payload.kpiid = this.currentKpiId;
      const sub = this.kpiService.updateKpis(payload).subscribe(res => {
        res.isSuccess ? this.toast.success(res.message) : this.toast.error(res.message);
        if (res.isSuccess) this.closeModal();
      });
      this.subs.push(sub);
    } else {
      const sub = this.kpiService.createkpis(payload).subscribe(res => {
        res.isSuccess ? this.toast.success(res.message) : this.toast.error(res.message);
        if (res.isSuccess) this.closeModal();
      });
      this.subs.push(sub);
    }
  }
}
