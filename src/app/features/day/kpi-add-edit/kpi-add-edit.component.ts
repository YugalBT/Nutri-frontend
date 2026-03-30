import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { SharedModule } from '../../../shared/shared.module';
import { ToastService } from '../../../shared/services/toast.service';
import { CommonService } from '../../../shared/services/common.service';
import { KpiService } from '../../../core/services/day/kpi.service';
import { ApiResponse } from '../../../core/models/api-response';
import { FarmList } from '../../../core/models/farm-list';
import { PERMISSIONS } from '../../../core/constants/permissions.constants';
import { FormulaList } from '../../../core/models/formula-list';
import { TranslatePipe } from '../../../i18n/translate.pipe';

declare var bootstrap: any;

@Component({
  selector: 'app-kpi-add-edit',
  standalone: true,
  imports: [SharedModule,TranslatePipe],
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

  private initializeForm() {
    this.form = this.fb.group({
      formulaId: ['', Validators.required],
      kpiname: ['', [Validators.required, Validators.maxLength(20)]],
    });

  }

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
    this.form.reset();

    if (edit && data) {
      this.form.patchValue({
        kpiname: data.kpiname,
        kpiid:data.kpiid,
        formulaId: data.formulaId,
      });

      this.currentKpiId = data.kpiid;
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
    if (!this.form.valid) {
      this.toast.warning('Please fill all required fields');
      return;
    }

    const payload = { ...this.form.value };

    if (this.isEdit && this.currentKpiId) {
      payload.kpiid = this.currentKpiId;

      const sub = this.kpiService.updateKpis(payload).subscribe(res => {
        if (res.isSuccess) {
          this.toast.success(res.message);
          this.closeModal();
        } else {
          this.toast.error(res.message);
        }
      });

      this.subs.push(sub);
    } else {
      const sub = this.kpiService.createkpis(payload).subscribe(res => {
        if (res.isSuccess) {
          this.toast.success(res.message);
          this.closeModal();
        } else {
          this.toast.error(res.message);
        }
      });

      this.subs.push(sub);
    }
  }
}
