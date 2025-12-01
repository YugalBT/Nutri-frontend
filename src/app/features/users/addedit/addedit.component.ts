// addedit.component.ts
import { Component, ElementRef, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SharedModule } from '../../../shared/shared.module';
import { TranslatePipe } from '../../../i18n/translate.pipe';
import { RoleList } from '../../../core/models/rolelist';
import { Subscription } from 'rxjs';
import { CommonService } from '../../../shared/services/common.service';
import { ToastService } from '../../../shared/services/toast.service';
import { UsersService } from '../../../core/services/users/user.service';

declare var bootstrap: any;

@Component({
  selector: 'app-addedit',
  standalone: true,
  imports: [SharedModule, TranslatePipe],
  templateUrl: './addedit.component.html',
  styleUrls: ['./addedit.component.css']
})
export class AddeditComponent implements OnInit, OnDestroy {
  @ViewChild('userModal') userModal!: ElementRef;
  private modalInstance: any;
  form!: FormGroup;
  isEdit = false;
  roles: RoleList[] = [];
  rolesLoading = false;
  rolesError: string | null = null;
  private subs: Subscription[] = [];
  private currentUserId: string | null = null;

  constructor(
    private fb: FormBuilder, 
    private commonService: CommonService, 
    private usersService: UsersService,
     private toast: ToastService
  ) {}

  ngOnInit() {
    this.initializeForm();
    this.loadRoles();
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  private initializeForm() {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.pattern(/^[A-Za-z]+$/)]],
      middleName: ['', [Validators.pattern(/^[A-Za-z]+$/)]],
      lastName: ['', [Validators.required, Validators.pattern(/^[A-Za-z]+$/)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.pattern(/^[0-9]+$/), Validators.minLength(10), Validators.maxLength(10),
        Validators.required]],
      roleId: [null, Validators.required],
      password: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/)]],
      isActive: [true]
    });
  }

  private loadRoles(force = false): void {
    if (!force && this.roles.length > 0) return;

    this.rolesLoading = true;
    this.rolesError = null;

    const sub = this.commonService.getRoles().subscribe({
      next: (res) => {
        this.roles = res?.data || [];
        this.rolesLoading = false;
        const currentRole = this.form.get('roleId')?.value;
        if (!currentRole && this.roles.length > 0) {
          this.form.patchValue({ roleId: this.roles[0].roleId });
        }
      },
      error: (err) => {
        this.roles = [];
        this.rolesLoading = false;
        this.rolesError = 'Failed to load roles. Please try again.';
      }
    });

    this.subs.push(sub);
  }

  openModal(edit = false, data?: any) {
    this.isEdit = edit;
    this.form.reset({ isActive: true });

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
      this.currentUserId = data.userId;
       this.form.get('password')?.clearValidators();
    this.form.get('password')?.updateValueAndValidity();
    } else {
      this.currentUserId = null;
      
    }

    this.modalInstance = new bootstrap.Modal(this.userModal.nativeElement);
    this.modalInstance.show();
  }

  closeModal() {
    if (this.modalInstance) {
      this.modalInstance.hide();
    }
  }

 saveUser() {
  if (!this.form.valid) {
      const payload = this.form.getRawValue();
      delete payload.password;
    this.toast.warning('Please fill all required fields');
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
    password: v.password
  };

  if (this.isEdit && this.currentUserId) {
    payload.userId = this.currentUserId;

    const sub = this.usersService.updateUser(payload).subscribe(res => {
      if (res.isSuccess) {
        this.toast.success(res.message);
        this.afterSuccess();
      } else {
        this.toast.error(res.message);
      }
    });
    this.subs.push(sub);

  } else {
    const sub = this.usersService.createUser(payload).subscribe(res => {
      if (res?.isSuccess) {
        this.toast.success(res.message);
        this.afterSuccess();
      } else {
        this.toast.error(res.message || 'Creation failed');
      }
    });
    this.subs.push(sub);
  }
}


  private afterSuccess() {
    this.usersService.notifyUsersChanged();
    this.closeModal();
  }
}
