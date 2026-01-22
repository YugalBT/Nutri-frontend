import { Component, ElementRef, OnInit, ViewChild, OnDestroy } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormArray,
  FormsModule,
  ReactiveFormsModule
} from '@angular/forms';
import { SharedModule } from '../../../shared/shared.module';
import { TranslatePipe } from '../../../i18n/translate.pipe';
import { RoleList } from '../../../core/models/rolelist';
import { Subscription } from 'rxjs';
import { CommonService } from '../../../shared/services/common.service';
import { ToastService } from '../../../shared/services/toast.service';
import { UsersService } from '../../../core/services/users/user.service';
import { PERMISSIONS } from '../../../core/constants/permissions.constants';
import { TranslateService } from '../../../i18n/translate.service';
import { PhoneService } from '../../../shared/phone.service';
import { CompanyService } from '../../../core/services/company/company.service';
import { CompanyList } from '../../../core/models/company-list';

declare var bootstrap: any;

@Component({
  selector: 'app-addedit',
  standalone: true,
  imports: [
    SharedModule,
    TranslatePipe,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './addedit.component.html',
  styleUrls: ['./addedit.component.css']
})
export class AddeditComponent implements OnInit, OnDestroy {

  @ViewChild('userModal') userModal!: ElementRef;

  form!: FormGroup;
  modalInstance: any;

  isEdit = false;
  showCurrent = false;

  roles: RoleList[] = [];
  rolesLoading = false;
  rolesError: string | null = null;

  companies: CompanyList[] = [];
  filteredCompanies: CompanyList[] = [];

  searchCompany = '';
  showCompanyDropdown = false;

  private subs: Subscription[] = [];
  private currentUserId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private commonService: CommonService,
    private usersService: UsersService,
    private toast: ToastService,
    private translate: TranslateService,
    public phoneService: PhoneService,
    private companiesService: CompanyService
  ) { }

  ngOnInit(): void {

    if (
      !this.commonService.checkPermission(PERMISSIONS.UserAdd) &&
      !this.commonService.checkPermission(PERMISSIONS.UserEdit)
    ) {
      return;
    }

    this.initializeForm();
    this.loadRoles();
    this.loadCompanies();
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  /* ---------------- FORM ---------------- */

  private initializeForm(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.pattern(/^[A-Za-z]+$/)]],
      middleName: ['', [Validators.pattern(/^[A-Za-z]+$/)]],
      lastName: ['', [Validators.required, Validators.pattern(/^[A-Za-z]+$/)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [
        Validators.required,
        Validators.pattern(/^[0-9]+$/),
        Validators.minLength(10),
        Validators.maxLength(10)
      ]],
      roleId: [null, Validators.required],
      tenantIds: this.fb.array([], Validators.required),
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/)
      ]],
      isActive: [true]
    });
  }

  get tenantIds(): FormArray {
    return this.form.get('tenantIds') as FormArray;
  }

  /* ---------------- ROLES ---------------- */

  private loadRoles(): void {
    this.rolesLoading = true;
    this.rolesError = null;

    const sub = this.commonService.getRoles().subscribe({
      next: res => {
        this.roles = res?.data || [];
        this.rolesLoading = false;
      },
      error: () => {
        this.roles = [];
        this.rolesLoading = false;
        this.rolesError =
          this.translate.instant('common.failedToLoadRoles') ||
          'Failed to load roles';
      }
    });

    this.subs.push(sub);
  }

  /* ---------------- COMPANIES ---------------- */

  loadCompanies(): void {
    const payload = { pageNumber: 1, pageSize: 100, searchText: '' };

    const sub = this.companiesService.getAllCompaniesPaginated(payload)
      .subscribe(res => {
        this.companies = res?.data || [];
        this.filteredCompanies = [...this.companies];
      });

    this.subs.push(sub);
  }

  toggleCompanyDropdown(): void {
    this.showCompanyDropdown = !this.showCompanyDropdown;
    if (this.showCompanyDropdown) {
      this.filteredCompanies = [...this.companies];
    }
  }

  onSearchCompany(): void {
    const term = this.searchCompany.trim().toLowerCase();

    if (!term) {
      this.filteredCompanies = [...this.companies];
      return;
    }

    this.filteredCompanies = this.companies.filter(c =>
      c.companyName?.toLowerCase().includes(term)
    );
  }

  onCompanyCheckboxChange(id: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;

    if (checked && !this.tenantIds.value.includes(id)) {
      this.tenantIds.push(this.fb.control(id));
    }

    if (!checked) {
      const index = this.tenantIds.controls.findIndex(c => c.value === id);
      if (index > -1) this.tenantIds.removeAt(index);
    }
  }

  removeCompanyChip(id: string): void {
    const index = this.tenantIds.controls.findIndex(c => c.value === id);
    if (index > -1) this.tenantIds.removeAt(index);
  }

  getCompanyName(id: string): string {
    return this.companies.find(c => c.tenantId === id)?.companyName ?? '';
  }

  /* ---------------- MODAL ---------------- */

  openModal(edit = false, data?: any): void {
    this.isEdit = edit;
    this.form.reset({ isActive: true });
    this.tenantIds.clear();
    this.searchCompany = '';
    this.showCompanyDropdown = false;

    if (edit && data) {
      this.form.patchValue({
        name: data.firstName,
        middleName: data.middleName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        roleId: data.roleId,
        isActive: data.isActive
      });

      data.tenantIds?.forEach((id: string) => {
        this.tenantIds.push(this.fb.control(id));
      });

      this.currentUserId = data.userId;
      this.form.get('password')?.clearValidators();
      this.form.get('password')?.updateValueAndValidity();
    }

    this.modalInstance = new bootstrap.Modal(this.userModal.nativeElement);
    this.modalInstance.show();
  }

  closeModal(): void {
    this.showCompanyDropdown = false;
    this.searchCompany = '';
    this.modalInstance?.hide();
  }

  /* ---------------- SAVE ---------------- */

  saveUser(): void {

    if (
      !this.commonService.checkPermission(PERMISSIONS.UserAdd) &&
      !this.commonService.checkPermission(PERMISSIONS.UserEdit)
    ) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.warning(
        this.translate.instant('common.formInvalid') ||
        'Please fill all required fields'
      );
      return;
    }

    const v = this.form.value;
    const payload: any = {
      firstName: v.name,
      middleName: v.middleName,
      lastName: v.lastName,
      email: v.email,
      phone: v.phone,
      roleId: v.roleId,
      tenantIds: v.tenantIds,
      password: v.password
    };

    if (this.isEdit && this.currentUserId) {
      payload.userId = this.currentUserId;
      this.usersService.updateUser(payload).subscribe(res => {
        res.isSuccess ? this.afterSuccess() : this.toast.error(res.message);
      });
    } else {
      this.usersService.createUser(payload).subscribe(res => {
        res.isSuccess ? this.afterSuccess() : this.toast.error(res.message);
      });
    }
  }

  private afterSuccess(): void {
    this.usersService.notifyUsersChanged();
    this.closeModal();
  }
}
