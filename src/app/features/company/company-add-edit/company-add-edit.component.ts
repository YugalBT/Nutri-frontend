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
  showCurrent = false;
  roleList: RoleItem[] = [];

  constructor(
    private fb: FormBuilder,
    private companyService: CompanyService,
    private spinner: NgxSpinnerService,
    private translate: TranslateService,
    private roleService: AddEditRoleService,
    private toast: ToastService,
    private commonService: CommonService
  ) {}

  ngOnInit(): void {
    if (
      !this.commonService.checkPermission(PERMISSIONS.TenantAdd) ||
      !this.commonService.checkPermission(PERMISSIONS.TenantEdit) ||
      !this.commonService.checkPermission(PERMISSIONS.TenantDelete)
    ) return;

    this.form = this.fb.group({
      tenantId: [''],

      // Primary (Company Owner)
      firstName: ['', [Validators.required,Validators.minLength(3),Validators.maxLength(50) ,Validators.pattern(/^[A-Za-z]+$/)]],
      middleName: ['', [Validators.minLength(3),Validators.maxLength(50) ,Validators.pattern(/^[A-Za-z]+$/)]],
      lastName: ['', [Validators.required,Validators.minLength(3),Validators.maxLength(50) , Validators.pattern(/^[A-Za-z]+$/)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(10),
        Validators.pattern(/^[0-9]+$/)
      ]],

      companyName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      code: ['', [Validators.required, Validators.minLength(3)]],
      url: ['',  [
    Validators.pattern(
      /^(https?:\/\/)(www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}([\/\w .-]*)*\/?$/
    )
  ]],
      logo: ['', Validators.required],

      streetAddress: ['', Validators.required],
      city: ['', Validators.required, Validators.pattern(/^[A-Za-z\s]+$/)],
      country: ['', Validators.required, Validators.pattern(/^[A-Za-z\s]+$/)],
      zipCode: ['', [Validators.required, Validators.pattern(/^[0-9]{5,6}$/)]],

      // Admin
      userFirstName: ['', [Validators.required,Validators.minLength(3),Validators.maxLength(50) ,Validators.pattern(/^[A-Za-z]+$/)]],
      userMiddleName: ['', [Validators.minLength(3),Validators.maxLength(50) ,Validators.pattern(/^[A-Za-z]+$/)]],
      userLastName: ['', [Validators.required,Validators.minLength(3),Validators.maxLength(50) , Validators.pattern(/^[A-Za-z]+$/)]],
      userEmail: ['', [Validators.required, Validators.email]],
      userPhoneNumber: ['', [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(10),
        Validators.pattern(/^[0-9]+$/)
      ]],

      sameAsPrimaryUser: [false],

      password: ['', [
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/)
      ]],

      roleId: ['', [Validators.required]],
      isActive: [true],
      isFirstLogin: [false]
    });

    this.loadRoles();

    // ✅ COPY ONLY WHEN CHECKBOX IS CLICKED
    this.form.get('sameAsPrimaryUser')?.valueChanges.subscribe((checked: boolean) => {
      if (checked) {
        this.copyPrimaryToAdmin();
      }
    });
  }

  // -------------------------
  // COPY LOGIC
  // -------------------------
  copyPrimaryToAdmin(): void {
    this.form.patchValue({
      userFirstName: this.form.get('firstName')?.value,
      userMiddleName: this.form.get('middleName')?.value,
      userLastName: this.form.get('lastName')?.value,
      userEmail: this.form.get('email')?.value,
      userPhoneNumber: this.form.get('phoneNumber')?.value
    });
  }

  // -------------------------
  // ROLES
  // -------------------------
  loadRoles(): void {
    this.spinner.show();
    this.roleService.getRoles({
      pageNo: 1,
      recordPerPage: 1000,
      status: 2,
      isShow: true
    }).subscribe({
      next: (res: any) => {
        this.roleList = res?.data || res?.items || [];
        this.spinner.hide();
      },
      error: () => {
        this.spinner.hide();
        this.toast.error('Error loading roles');
      }
    });
  }

  // -------------------------
  // MODAL
  // -------------------------
  openModal(edit = false, data?: any): void {
    this.isEdit = edit;

    if (edit && data) {
      this.form.patchValue({ ...data, logo: data.logo || '' });

      // ❌ DO NOT AUTO COPY
      this.form.patchValue({ sameAsPrimaryUser: false });

      this.form.get('password')?.clearValidators();
      this.form.get('roleId')?.clearValidators();
    } else {
      this.form.reset({
        isActive: true,
        isFirstLogin: false,
        sameAsPrimaryUser: false
      });

      this.form.get('password')?.setValidators([
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/)
      ]);

      this.form.get('roleId')?.setValidators([Validators.required]);
    }

    this.form.get('password')?.updateValueAndValidity();
    this.form.get('roleId')?.updateValueAndValidity();

    this.modalInstance = new bootstrap.Modal(this.companyModal.nativeElement);
    this.modalInstance.show();
  }

  closeModal(): void {
    this.modalInstance?.hide();
  }

  // -------------------------
  // LOGO
  // -------------------------
  onLogoChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const reader = new FileReader();
    reader.onload = () => this.form.patchValue({ logo: reader.result });
    reader.readAsDataURL(input.files[0]);
  }

  onFirstLoginToggle(event: Event): void {
  const checked = (event.target as HTMLInputElement).checked;

  // ✅ If checkbox clicked → send false
  this.form.patchValue({
    isFirstLogin: checked ? false : true
  });
}

  removeLogo(): void {
    this.form.patchValue({ logo: null });
    this.fileInput.nativeElement.value = '';
  }

  // -------------------------
  // SAVE
  // -------------------------
  saveCompany(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.form.value as Company;

    const request$ = this.isEdit
      ? this.companyService.updateCompany(payload)
      : this.companyService.createCompany(payload);

    request$.subscribe({
      next: (res: ApiResponse<any>) => {
        if (res?.isSuccess) {
          this.toast.success(res.message || 'Success');
          this.companyService.notifyCompaniesChanged();
          this.closeModal();
        } else {
          this.toast.error(res.message || 'Operation failed');
        }
      },
      error: () => this.toast.error('Something went wrong')
    });
  }
}
