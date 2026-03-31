import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SharedModule } from '../../../shared/shared.module';
import { LanguageService } from '../../../core/services/language/language.service';
import { ToastService } from '../../../shared/services/toast.service';
import { ApiResponse } from '../../../core/models/api-response';
import { TranslatePipe } from '../../../i18n/translate.pipe';
import { TranslateService } from '../../../i18n/translate.service';
import { CommonService } from '../../../shared/services/common.service';
import { PERMISSIONS } from '../../../core/constants/permissions.constants';


declare var bootstrap: any;

@Component({
  selector: 'app-language-add-edit',
  standalone: true,
  imports: [SharedModule, TranslatePipe],
  templateUrl: './language-add-edit.component.html',
  styleUrl: './language-add-edit.component.css'
})
export class LanguageAddEditComponent implements OnInit {

  @ViewChild('languageModal') languageModal!: ElementRef;

  form!: FormGroup;
  isEdit = false;
  canSave = false;
  isSubmitted = false;
  modalInstance: any;

  constructor(
    private fb: FormBuilder,
    private languageService: LanguageService,
    private toast: ToastService,
    private transalateservice : TranslateService,
    private commonService: CommonService
  ) {}

  // --------------------------------------------------
  // INIT
  // --------------------------------------------------
  ngOnInit(): void {
    this.form = this.fb.group({
      languageId: [''], // GUID (only for edit)
      languageCode: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(5),
        Validators.pattern(/^[a-zA-Z]+$/)
      ]],
      languageName: ['', [
        Validators.required,
        Validators.minLength(3)
      ]],
      isActive: [true]
    });
  }

  // --------------------------------------------------
  // MODAL
  // --------------------------------------------------
  openModal(edit = false, data?: any): void {
    this.isEdit = edit;
    this.canSave = edit
      ? this.commonService.checkPermission(PERMISSIONS.LanguageEdit, false)
      : this.commonService.checkPermission(PERMISSIONS.LanguageAdd, false);
    if (!this.canSave) {
      this.toast.error(this.transalateservice.instant('common.noPermission') || 'No permission');
      return;
    }
    this.isSubmitted = false;

    if (edit && data) {
      this.form.patchValue(data);
    } else {
      this.form.reset({
        isActive: true
      });
    }

    this.modalInstance = new bootstrap.Modal(this.languageModal.nativeElement);
    this.modalInstance.show();
  }

  closeModal(): void {
    this.isSubmitted = false;
    this.modalInstance?.hide();
  }

  // --------------------------------------------------
  // SAVE
  // --------------------------------------------------
  save(): void {
    const hasPermission = this.isEdit
      ? this.commonService.checkPermission(PERMISSIONS.LanguageEdit)
      : this.commonService.checkPermission(PERMISSIONS.LanguageAdd);
    if (!hasPermission) return;
    this.isSubmitted = true;
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      this.toast.warning('Please fill all required fields correctly');
      return;
    }

    const model = this.form.getRawValue();

    const request$ = this.isEdit
      ? this.languageService.updateLanguages(model)
      : this.languageService.createLanguages(model);

    request$.subscribe({
      next: (res: ApiResponse<any>) => {
        if (res?.isSuccess) {
          this.toast.success(res.message);
          this.languageService.notifylanguageChanged();
          this.closeModal();
        } else {
          this.toast.error(res.message);
        }
      },
      error: () => this.toast.error('Something went wrong')
    });
  }

  // --------------------------------------------------
  // VALIDATION HELPER
  // --------------------------------------------------
  isInvalid(controlName: string, error?: string): boolean {
    const control = this.form.get(controlName);
    if (!control) return false;

    const show = control.touched || this.isSubmitted;
    return error ? show && !!control.errors?.[error] : show && control.invalid;
  }
}
