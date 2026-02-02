import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { ToastService } from '../../shared/services/toast.service';
import { CompanysettingService } from '../../core/services/company-setting/companysetting.service';
import { take } from 'rxjs';
import { ApiResponse } from '../../core/models/api-response';
import { CustomValidators } from '../../core/helpers/validators';
import { CommonService } from '../../shared/services/common.service';
import { PERMISSIONS } from '../../core/constants/permissions.constants';
import { ImageValidatorDirective } from '../../image-validator.directive';
import { TranslatePipe } from '../../i18n/translate.pipe';
import { FormHelper } from '../../core/helpers/form.helper';

@Component({
  selector: 'app-companysetting',
  standalone: true,
  imports: [ReactiveFormsModule, SharedModule, TranslatePipe, ImageValidatorDirective],
  templateUrl: './companysetting.component.html',
  styleUrl: './companysetting.component.css'
})
export class CompanysettingComponent implements OnInit {

  companyForm!: FormGroup;
  imagePreview: string | null = null;
  logoFile!: File;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  constructor(
    private formHelper: FormHelper,
    private fb: FormBuilder,
    private toast: ToastService,
    private companyService: CompanysettingService,
    private commonService: CommonService
  ) { }

  ngOnInit(): void {

    if (!this.commonService.checkPermission(PERMISSIONS.SettingEdit) || !this.commonService.checkPermission(PERMISSIONS.SettingView))
      return;
    this.setupForm();
    this.companyService.companyDetails().pipe(take(1)).subscribe((res: any) => {
      if (res.isSuccess && res.data) {

        const { logo, ...rest } = res?.data;

        this.companyForm.patchValue(rest);

        if (logo && typeof logo === 'string') {
          this.imagePreview = logo;
          //this.companyForm.get('logo')?.setValue(logo);
        }
      } else {
        this.toast.error(res?.message);
      }
    });
  }

  setupForm() {
    this.companyForm = this.fb.group({
      logo: [null],
      companyName: ['', [CustomValidators.required(), CustomValidators.maxLength(50)]],
      email: ['', [CustomValidators.required(), CustomValidators.email()]],
      phoneNumber: ['', [CustomValidators.required(), CustomValidators.onlyNumbers(), CustomValidators.minLength(10), CustomValidators.maxLength(15)]],
      streetAddress: ['', [CustomValidators.required(), CustomValidators.maxLength(100)]],
      city: ['', [CustomValidators.required(), CustomValidators.onlyChars(), CustomValidators.minLength(3), CustomValidators.maxLength(50)]],
      country: ['', [CustomValidators.required(), CustomValidators.onlyChars(), CustomValidators.minLength(3), CustomValidators.maxLength(50)]],
      zipCode: ['', [CustomValidators.required(), CustomValidators.onlyNumbers(), CustomValidators.minLength(5), CustomValidators.maxLength(6)]],
      effectiveDate: [null],
      expiryDate: [null]
    });
  }

  // onImageChange(event: any) {
  //   const file = event.target.files[0];
  //   if (!file) return;

  //   if (!['image/png', 'image/jpeg'].includes(file.type)) {
  //     this.toast.error("Only JPG / PNG allowed");
  //     this.fileInput.nativeElement.value = '';
  //     return;
  //   }

  //   const reader = new FileReader();
  //   reader.onload = () => {
  //     this.imagePreview = reader.result as string;
  //     this.companyForm.patchValue({ logo: reader.result });
  //   };
  //   reader.readAsDataURL(file);
  // }

  onLogoSelected(event: any): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.logoFile = file;

    // Optional preview
    const reader = new FileReader();
    reader.onload = () => this.imagePreview = reader.result as string;
    reader.readAsDataURL(file);
  }

  removeImage() {
    this.imagePreview = null;
    this.companyForm.patchValue({ logo: null });
    this.fileInput.nativeElement.value = '';
  }

  onSubmit() {
    if (!this.commonService.checkPermission(PERMISSIONS.SettingEdit) || !this.commonService.checkPermission(PERMISSIONS.SettingView))
      return;
    if (this.companyForm.invalid) {
      this.companyForm.markAllAsTouched();
      this.toast.error("Please fill all required fields correctly");
      return;
    }

    var formData = this.formHelper.ConvertToFormData(this.companyForm.getRawValue());

    // 🔹 Append LOGO FILE (IMPORTANT)
    if (this.logoFile) {
      formData.append('logo', this.logoFile); // must match backend property name
    }


    this.companyService.updateCompanySetting(formData).subscribe({
      next: (res: ApiResponse<any>) => {
        if (res.isSuccess) this.toast.success(res?.message);
        else this.toast.error(res?.message);
      },
      error: (err: any) => {
        this.toast.error(err?.error?.message);
      }
    });
  }
}
