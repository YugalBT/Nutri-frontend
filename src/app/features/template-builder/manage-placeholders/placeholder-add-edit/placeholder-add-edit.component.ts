import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastService } from '../../../../shared/services/toast.service';
import { ManagePlaceholderService } from '../../../../core/services/template-builder/manage-placeholder/manage-placeholder.service';
import { TemplatePlaceholderList } from '../../../../core/models/template-builder/template-placeholder-list';
import { SharedModule } from '../../../../shared/shared.module';
import { TranslatePipe } from '../../../../i18n/translate.pipe';
import { CommonService } from '../../../../shared/services/common.service';
import { PERMISSIONS } from '../../../../core/constants/permissions.constants';

declare var bootstrap: any;

@Component({
  selector: 'app-template-placeholder-add-edit',
  standalone: true,
  imports: [SharedModule,ReactiveFormsModule,TranslatePipe],
  templateUrl: './placeholder-add-edit.component.html',
  styleUrl: './placeholder-add-edit.component.css'
})
export class TemplatePlaceholderAddEditComponent {

  @ViewChild('placeholderModal', { static: true }) placeholderModal!: ElementRef;

  form!: FormGroup;
  modal: any;
  isEdit = false;
  canSave = false;
  currentId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private toast: ToastService,
    private placeholderService: ManagePlaceholderService,
    private commonService: CommonService
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      placeholderValue: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]]
    });

    this.modal = new bootstrap.Modal(this.placeholderModal.nativeElement, { backdrop: 'static' });
  }

  openModal(edit = false, data?: TemplatePlaceholderList) {
    this.isEdit = edit;
    this.canSave = edit
      ? this.commonService.checkPermission(PERMISSIONS.PlaceholderEdit, false)
      : this.commonService.checkPermission(PERMISSIONS.PlaceholderAdd, false);
    if (!this.canSave) {
      this.toast.error('No permission');
      return;
    }
    this.form.reset();
    this.currentId = null;

    if (edit && data) {
      this.form.patchValue({
        placeholderValue: data.placeholderValue
      });
      this.currentId = data.id;
    }

    this.modal.show();
  }

  closeModal() {
    this.modal.hide();
  }

  save() {
    const hasPermission = this.isEdit
      ? this.commonService.checkPermission(PERMISSIONS.PlaceholderEdit)
      : this.commonService.checkPermission(PERMISSIONS.PlaceholderAdd);
    if (!hasPermission) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.warning('Please enter placeholder value');
      return;
    }

    const payload: any = { ...this.form.value };

    if (this.isEdit && this.currentId) {
      payload.id = this.currentId;
      this.placeholderService.updatePlaceholder(payload).subscribe(res => {
        res.isSuccess ? this.toast.success(res.message) : this.toast.error(res.message);
        this.closeModal();
      });
    } else {
      this.placeholderService.createPlaceholder(payload).subscribe(res => {
        res.isSuccess ? this.toast.success(res.message) : this.toast.error(res.message);
        this.closeModal();
      });
    }
  }
}
