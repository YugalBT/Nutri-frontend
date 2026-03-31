import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { SharedModule } from '../../../shared/shared.module';
import { TranslatePipe } from '../../../i18n/translate.pipe';
import { ToastService } from '../../../shared/services/toast.service';
import { OperatorServiceService } from '../../../core/services/operators/operator-service.service';
import { OperatorList } from '../../../core/models/operator-list';
import { CommonService } from '../../../shared/services/common.service';
import { PERMISSIONS } from '../../../core/constants/permissions.constants';


declare var bootstrap: any;

@Component({
  selector: 'app-operator-add-edit',
  standalone: true,
  imports: [SharedModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './operator-add-edit.component.html',
  styleUrl: './operator-add-edit.component.css'
})
export class OperatorAddEditComponent {

  @ViewChild('operatorModal', { static: true }) operatorModal!: ElementRef;

  form!: FormGroup;
  modalInstance: any;
  isEdit = false;
  canSave = false;
  currentOperatorId: string | null = null;
  subs: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private toast: ToastService,
    private operatorService: OperatorServiceService,
    private commonService: CommonService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      operatorName: ['', [Validators.required]],
      operatorDisplayName: ['', [Validators.required]]
    });

    this.modalInstance = new bootstrap.Modal(this.operatorModal.nativeElement, {
      backdrop: 'static'
    });
  }

  openModal(edit = false, data?: OperatorList) {
    this.isEdit = edit;
    this.canSave = edit
      ? this.commonService.checkPermission(PERMISSIONS.OperatorEdit, false)
      : this.commonService.checkPermission(PERMISSIONS.OperatorAdd, false);
    if (!this.canSave) {
      this.toast.warning('No permission');
      return;
    }

    this.form.reset();
    this.currentOperatorId = null;

    if (edit && data) {
      this.form.patchValue(data);
      this.currentOperatorId = data.operatorId;
    }

    this.modalInstance.show();
  }

  closeModal() {
    this.modalInstance.hide();
  }

  save() {
    const hasPermission = this.isEdit
      ? this.commonService.checkPermission(PERMISSIONS.OperatorEdit)
      : this.commonService.checkPermission(PERMISSIONS.OperatorAdd);
    if (!hasPermission) return;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.warning('Please fill all required fields');
      return;
    }

    const payload = { ...this.form.value };

    const request$ = this.isEdit
      ? this.operatorService.updateOperator({ ...payload, operatorId: this.currentOperatorId })
      : this.operatorService.createOperator(payload);

    const sub = request$.subscribe({
      next: res => {
        res.isSuccess ? this.toast.success(res.message) : this.toast.error(res.message);
        if (res.isSuccess) this.closeModal();
      },
      error: err => this.toast.error(err?.message)
    });

    this.subs.push(sub);
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
  }
}
