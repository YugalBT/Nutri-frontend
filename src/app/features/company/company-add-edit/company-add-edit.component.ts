// import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
// import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { SharedModule } from '../../../shared/shared.module';
// import { TranslatePipe } from '../../../i18n/translate.pipe';
// import { Company } from '../../../core/models/company-add-edit';
// import { CompanyService } from '../../../core/services/company/company.service';
// import { ToastService } from '../../../shared/services/toast.service';
// import { ApiResponse } from '../../../core/models/api-response';
// import { RoleItem } from '../../../core/models/add-edit-role';
// import { TranslateService } from '../../../i18n/translate.service';
// import { AddEditRoleService } from '../../../core/services/role/add-edit-role.service';
// import { NgxSpinnerService } from 'ngx-spinner';
// import { CommonService } from '../../../shared/services/common.service';
// import { PERMISSIONS } from '../../../core/constants/permissions.constants';
// import { ImageValidatorDirective } from '../../../image-validator.directive';

// declare var bootstrap: any;

// @Component({
//   selector: 'app-company-add-edit',
//   standalone: true,
//   imports: [SharedModule, TranslatePipe, ImageValidatorDirective],
//   templateUrl: './company-add-edit.component.html',
//   styleUrls: ['./company-add-edit.component.css']
// })
// export class CompanyAddEditComponent implements OnInit {

//   @ViewChild('companyModal') companyModal!: ElementRef;
//   @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

//   private modalInstance: any;
//   form!: FormGroup;
//   isEdit = false;
//   showCurrent = false;
//   roleList: RoleItem[] = [];
//   isSubmitted = false;
//   logoPreview: string | null = null;


//   constructor(
//     private fb: FormBuilder,
//     private companyService: CompanyService,
//     private spinner: NgxSpinnerService,
//     private translate: TranslateService,
//     private roleService: AddEditRoleService,
//     private toast: ToastService,
//     private commonService: CommonService
//   ) { }

//   ngOnInit(): void {
//     if (
//       !this.commonService.checkPermission(PERMISSIONS.TenantAdd) ||
//       !this.commonService.checkPermission(PERMISSIONS.TenantEdit) ||
//       !this.commonService.checkPermission(PERMISSIONS.TenantDelete)
//     ) return;

//     this.form = this.fb.group({
//       tenantId: [''],

//       // Primary (Company Owner)
//       firstName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50), Validators.pattern(/^[A-Za-z]+$/)]],
//       middleName: ['', [Validators.minLength(3), Validators.maxLength(50), Validators.pattern(/^[A-Za-z]+$/)]],
//       lastName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50), Validators.pattern(/^[A-Za-z]+$/)]],
//       email: ['', [Validators.required, Validators.email]],
//       phoneNumber: ['', [
//         Validators.required,
//         Validators.minLength(10),
//         Validators.maxLength(10),
//         Validators.pattern(/^[0-9]+$/)
//       ]],

//       companyName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
//       code: ['', [Validators.required, Validators.minLength(3)]],
//       url: ['', [
//         Validators.pattern(
//           /^(https?:\/\/)(www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}([\/\w .-]*)*\/?$/
//         )
//       ]],
//       logo: ['', Validators.required],

//       streetAddress: ['', Validators.required],
//       city: ['', [
//         Validators.required,
//         Validators.pattern(/^[A-Za-z\s]+$/)
//       ]],
//       country: ['', [
//         Validators.required,
//         Validators.pattern(/^[A-Za-z\s]+$/)
//       ]],
//       zipCode: ['', [Validators.required, Validators.pattern(/^[0-9]{5,6}$/)]],

//       // Admin
//       userFirstName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50), Validators.pattern(/^[A-Za-z]+$/)]],
//       userMiddleName: ['', [Validators.minLength(3), Validators.maxLength(50), Validators.pattern(/^[A-Za-z]+$/)]],
//       userLastName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50), Validators.pattern(/^[A-Za-z]+$/)]],
//       userEmail: ['', [Validators.required, Validators.email]],
//       userPhoneNumber: ['', [
//         Validators.required,
//         Validators.minLength(10),
//         Validators.maxLength(10),
//         Validators.pattern(/^[0-9]+$/)
//       ]],

//       sameAsPrimaryUser: [false],

//       password: ['', [
//         Validators.minLength(8),
//         Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/)
//       ]],

//       roleId: ['', [Validators.required]],
//       isActive: [true],
//       isFirstLogin: [false]
//     });

//     this.loadRoles();

//     // ✅ COPY ONLY WHEN CHECKBOX IS CLICKED
//     this.form.get('sameAsPrimaryUser')?.valueChanges.subscribe((checked: boolean) => {
//       if (checked) {
//         this.copyPrimaryToAdmin();
//       }
//     });
//     this.form.get('logo')?.valueChanges.subscribe(() => {
//       const input = this.fileInput?.nativeElement;
//       if (!input || !input.files?.length) return;

//       const file = input.files[0];
//       const reader = new FileReader();

//       reader.onload = () => {
//         this.logoPreview = reader.result as string;
//       };

//       reader.readAsDataURL(file);
//     });

//   }

//   // -------------------------
//   // COPY LOGIC
//   // -------------------------
//   copyPrimaryToAdmin(): void {
//     this.form.patchValue({
//       userFirstName: this.form.get('firstName')?.value,
//       userMiddleName: this.form.get('middleName')?.value,
//       userLastName: this.form.get('lastName')?.value,
//       userEmail: this.form.get('email')?.value,
//       userPhoneNumber: this.form.get('phoneNumber')?.value
//     });
//   }

//   // -------------------------
//   // ROLES
//   // -------------------------
//   loadRoles(): void {
//     this.spinner.show();
//     this.roleService.getRoles({
//       pageNo: 1,
//       recordPerPage: 1000,
//       status: 2,
//       isShow: true
//     }).subscribe({
//       next: (res: any) => {
//         this.roleList = res?.data || res?.items || [];
//         this.spinner.hide();
//       },
//       error: () => {
//         this.spinner.hide();
//         this.toast.error('Error loading roles');
//       }
//     });
//   }
//   isInvalid(controlName: string, error?: string): boolean {
//     const control = this.form?.get(controlName);
//     if (!control) return false;

//     const showError = control.dirty || this.isSubmitted;

//     if (error) {
//       return showError && !!control.errors?.[error];
//     }

//     return showError && control.invalid;
//   }

//   openModal(edit = false, data?: any): void {
//     this.isEdit = edit;
//     this.isSubmitted = false;

//     if (edit && data) {
//       // this.form.patchValue({ ...data });
//       // this.form.get('logo')?.reset(); 
//       const { logo, ...rest } = data;   // 🔥 REMOVE LOGO
//       this.form.patchValue(rest);       // SAFE
//       this.form.get('logo')?.reset();   // REQUIRED
//       this.logoPreview = logo ?? null;

//       if(logo)
//       {
//         this.form.get('logo')?.setErrors(null);
//         this.form.get('logo')?.updateValueAndValidity();
//       }
//       this.form.get('password')?.clearValidators();
      
//       //this.form.get('password')?.setErrors(null);

//       //this.form.get('roleId')?.clearValidators();
//       //this.form.get('roleId')?.setErrors(null);
//     } else {
//       this.form.reset({
//         isActive: true,
//         isFirstLogin: false,
//         sameAsPrimaryUser: false
//       });

//       this.form.get('password')?.setValidators([
//         Validators.required,
//         Validators.minLength(8),
//         Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/)
//       ]);

//       this.form.get('roleId')?.setValidators([Validators.required]);
//     }

//     this.form.get('password')?.updateValueAndValidity();
//     this.form.get('roleId')?.updateValueAndValidity();

//     this.modalInstance = new bootstrap.Modal(this.companyModal.nativeElement);
//     this.modalInstance.show();
//   }


//   closeModal(): void {
//     this.isSubmitted = false;
//     this.modalInstance?.hide();
//   }

//   // -------------------------
//   // LOGO
//   // -------------------------
//   onLogoSelected(event: Event) {
//     const file = (event.target as HTMLInputElement).files?.[0];
//     if (!file || this.form.get('logo')?.invalid) {
//       this.logoPreview = null;
//       return;
//     }

//     const reader = new FileReader();
//     reader.onload = () => this.logoPreview = reader.result as string;
//     reader.readAsDataURL(file);
//   }

//   onFirstLoginToggle(event: Event): void {
//     const checked = (event.target as HTMLInputElement).checked;

//     // checked = password reset needed
//     // so isFirstLogin must be FALSE
//     this.form.patchValue({
//       isFirstLogin: !checked
//     });
//   }


//   removeLogo(): void {
//     this.logoPreview = null;
//     this.form.get('logo')?.reset();
//     this.fileInput.nativeElement.value = '';
//   }

//   // -------------------------
//   // SAVE
//   // -------------------------
//   saveCompany(): void {
//     this.isSubmitted = true;

//     // 🔥 Force validation recalculation
//     this.form.markAllAsTouched();
//     this.form.updateValueAndValidity();

//     if (this.form.invalid) {

//       this.toast.warning('Please fill all required fields correctly');
//       return;
//     }

//     const payload: Company = {
//       ...this.form.value,
//       logo: this.logoPreview
//     };


//     const request$ = this.isEdit
//       ? this.companyService.updateCompany(payload)
//       : this.companyService.createCompany(payload);

//     request$.subscribe({
//       next: (res: ApiResponse<any>) => {
//         if (res?.isSuccess) {
//           this.toast.success(res?.message);
//           this.companyService.notifyCompaniesChanged();
//           this.closeModal();
//         } else {
//           this.toast.error(res?.message);
//         }
//       },
//       error: () => this.toast.error('Something went wrong')
//     });
//   }
// }
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SharedModule } from '../../../shared/shared.module';
import { TranslatePipe } from '../../../i18n/translate.pipe';
import { Company } from '../../../core/models/company-add-edit';
import { CompanyService } from '../../../core/services/company/company.service';
import { ToastService } from '../../../shared/services/toast.service';
import { ApiResponse } from '../../../core/models/api-response';
import { RoleItem } from '../../../core/models/add-edit-role';
import { TranslateService } from '../../../i18n/translate.service';
import { AddEditRoleService } from '../../../core/services/role/add-edit-role.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { CommonService } from '../../../shared/services/common.service';
import { PERMISSIONS } from '../../../core/constants/permissions.constants';
import { ImageValidatorDirective } from '../../../image-validator.directive';

declare var bootstrap: any;

@Component({
  selector: 'app-company-add-edit',
  standalone: true,
  imports: [SharedModule, TranslatePipe, ImageValidatorDirective],
  templateUrl: './company-add-edit.component.html',
  styleUrls: ['./company-add-edit.component.css']
})
export class CompanyAddEditComponent implements OnInit {

  @ViewChild('companyModal') companyModal!: ElementRef;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  private modalInstance: any;

  form!: FormGroup;
  isEdit = false;
  isSubmitted = false;
  showCurrent = false;

  roleList: RoleItem[] = [];
  logoPreview: string | null = null;

  constructor(
    private fb: FormBuilder,
    private companyService: CompanyService,
    private spinner: NgxSpinnerService,
    private translate: TranslateService,
    private roleService: AddEditRoleService,
    private toast: ToastService,
    private commonService: CommonService
  ) {}

  // --------------------------------------------------
  // INIT
  // --------------------------------------------------
  ngOnInit(): void {

    if (
      !this.commonService.checkPermission(PERMISSIONS.TenantAdd) &&
      !this.commonService.checkPermission(PERMISSIONS.TenantEdit)
    ) return;

    this.form = this.fb.group({
      tenantId: [''],

      // Primary user
      firstName: ['', [Validators.required, Validators.minLength(3), Validators.pattern(/^[A-Za-z]+$/)]],
      middleName: ['', [Validators.pattern(/^[A-Za-z]*$/)]],
      lastName: ['', [Validators.required, Validators.minLength(3), Validators.pattern(/^[A-Za-z]+$/)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],

      // Company
      companyName: ['', [Validators.required, Validators.minLength(3)]],
      code: ['', [Validators.required, Validators.minLength(3)]],
      url: ['', [Validators.pattern(/^(https?:\/\/).+/)]],
      logo: ['', Validators.required],

      // Address
      streetAddress: ['', Validators.required],
      city: ['', [Validators.required, Validators.pattern(/^[A-Za-z\s]+$/)]],
      country: ['', [Validators.required, Validators.pattern(/^[A-Za-z\s]+$/)]],
      zipCode: ['', [Validators.required, Validators.pattern(/^[0-9]{5,6}$/)]],

      // Admin user
      userFirstName: ['', Validators.required],
      userMiddleName: [''],
      userLastName: ['', Validators.required],
      userEmail: ['', [Validators.required, Validators.email]],
      userPhoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],

      sameAsPrimaryUser: [false],

      password: ['', [
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d).{8,}$/)
      ]],

      roleId: ['', Validators.required],
      isActive: [true],
      isFirstLogin: [false]
    });

    this.loadRoles();

    // Same as primary user logic
    this.form.get('sameAsPrimaryUser')?.valueChanges.subscribe((checked: boolean) => {
      if (checked) {
        this.copyPrimaryToAdmin();
        this.toggleAdminFields(true);
      } else {
        this.toggleAdminFields(false);
      }
    });

    // Logo preview
    this.form.get('logo')?.valueChanges.subscribe(() => {
      const input = this.fileInput?.nativeElement;
      if (!input || !input.files?.length) return;

      const reader = new FileReader();
      reader.onload = () => this.logoPreview = reader.result as string;
      reader.readAsDataURL(input.files[0]);
    });
  }

  // --------------------------------------------------
  // ADMIN FIELD HELPERS
  // --------------------------------------------------
  copyPrimaryToAdmin(): void {
    this.form.patchValue({
      userFirstName: this.form.get('firstName')?.value,
      userMiddleName: this.form.get('middleName')?.value,
      userLastName: this.form.get('lastName')?.value,
      userEmail: this.form.get('email')?.value,
      userPhoneNumber: this.form.get('phoneNumber')?.value
    });
  }

  toggleAdminFields(disable: boolean): void {
    const fields = [
      'userFirstName',
      'userMiddleName',
      'userLastName',
      'userEmail',
      'userPhoneNumber'
    ];

    fields.forEach(field => {
      const control = this.form.get(field);
      if (!control) return;
      disable ? control.disable({ emitEvent: false }) : control.enable({ emitEvent: false });
    });
  }

  // --------------------------------------------------
  // ROLES
  // --------------------------------------------------
  loadRoles(): void {
    this.spinner.show();

    this.roleService.getRoles({
      pageNo: 1,
      recordPerPage: 1000,
      status: 2,
      isShow: true
    }).subscribe({
      next: (res: any) => {
        this.roleList = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.items)
          ? res.items
          : [];
        this.spinner.hide();
      },
      error: () => {
        this.spinner.hide();
        this.toast.error(this.translate.instant('common.failedToLoadRoles') || 'Error loading roles');
      }
    });
  }

  // --------------------------------------------------
  // MODAL
  // --------------------------------------------------
  openModal(edit = false, data?: any): void {
    this.isEdit = edit;
    this.isSubmitted = false;

    if (edit && data) {
      const { logo, ...rest } = data;
      this.form.patchValue(rest);
      this.logoPreview = logo ?? null;

      if (this.form.get('sameAsPrimaryUser')?.value) {
        this.toggleAdminFields(true);
      }
    } else {
      this.form.reset({
        isActive: true,
        isFirstLogin: false,
        sameAsPrimaryUser: false
      });
      this.toggleAdminFields(false);
    }

    this.modalInstance = new bootstrap.Modal(this.companyModal.nativeElement);
    this.modalInstance.show();
  }

  closeModal(): void {
    this.isSubmitted = false;
    this.modalInstance?.hide();
  }

  // --------------------------------------------------
  // REQUIRED BY TEMPLATE ✅
  // --------------------------------------------------
  removeLogo(): void {
    this.logoPreview = null;
    this.form.get('logo')?.reset();
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  onFirstLoginToggle(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.form.patchValue({ isFirstLogin: !checked });
  }

  // --------------------------------------------------
  // SAVE
  // --------------------------------------------------
  saveCompany(): void {
    this.isSubmitted = true;
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      this.toast.warning(this.translate.instant('common.formInvalid') || 'Please fill all required fields correctly');
      return;
    }

    const payload: Company = {
      ...this.form.getRawValue(),
      logo: this.logoPreview
    };

    const request$ = this.isEdit
      ? this.companyService.updateCompany(payload)
      : this.companyService.createCompany(payload);

    request$.subscribe({
      next: (res: ApiResponse<any>) => {
        if (res?.isSuccess) {
          this.toast.success(res.message);
          this.companyService.notifyCompaniesChanged();
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
