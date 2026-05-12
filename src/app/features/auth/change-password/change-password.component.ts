import { Component, OnInit, signal } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { ApiResponse } from '../../../core/models/api-response';
import { ChangePasswordService } from '../../../core/services/change-password/change-password.service';
import { CommonService } from '../../../shared/services/common.service';
import { PERMISSIONS } from '../../../core/constants/permissions.constants';
import { TranslatePipe } from '../../../i18n/translate.pipe';
import { Store } from '@ngrx/store';
import { selectAuthUser } from '../../../state/auth/auth.selectors';
import { BrandingService } from '../../../shared/services/branding.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent implements OnInit {

  changePasswordForm!: FormGroup;
  isSubmitted = signal(false);
  isLoading = signal(false);

  // Password visibility
  showCurrent = false;
  showNew = false;
  showConfirm = false;
  passwordStrength = '';
  canSave = false;

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private passwordService: ChangePasswordService,
    private commonService: CommonService,
    private store: Store,
    private brandingService: BrandingService,
  ) {
    this.createForm();
    this.canSave = this.commonService.checkPermission(PERMISSIONS.ChangePasswordEdit, false);
  }

  ngOnInit(): void {
    // Apply supplier branding when a supplier user accesses this page.
    this.store.select(selectAuthUser).pipe(take(1)).subscribe(user => {
      this.brandingService.updateBranding(user);
    });
  }

  createForm() {
    this.changePasswordForm = this.fb.group(
      {
        currentPassword: ['', Validators.required],
        newPassword: [
          '',
          [
            Validators.required,
            Validators.minLength(6),
            Validators.pattern(/^(?=.*[A-Z])(?=.*[0-9]).+$/) // 1 uppercase & 1 number
          ]
        ],
        confirmPassword: ['', Validators.required]
      },
      { validators: this.passwordMatchValidator }
    );
  }

  toggle(type: string) {
    if (type === 'current') this.showCurrent = !this.showCurrent;
    if (type === 'new') this.showNew = !this.showNew;
    if (type === 'confirm') this.showConfirm = !this.showConfirm;
  }

  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { mismatch: true };
  }

  checkPasswordStrength() {
    const pwd = this.f['newPassword'].value;
    if (!pwd) return;

    if (/^(?=.*[A-Z])(?=.*[\W_])(?=.*[0-9]).{8,}$/.test(pwd)) this.passwordStrength = 'Strong';
    else if (/^(?=.*[A-Z])(?=.*[0-9]).{6,}$/.test(pwd)) this.passwordStrength = 'Medium';
    else this.passwordStrength = 'Weak';
  }

  get f() { return this.changePasswordForm.controls; }

  onSubmit() {
    if(!this.commonService.checkPermission(PERMISSIONS.ChangePasswordEdit))
      return;
    this.isSubmitted.set(true);
    if (this.changePasswordForm.invalid) {
      this.toastr.error('Please fix validation errors.');
      return;
    }

    const payload = {
      passWord: this.f['newPassword'].value,
      oldPassWord: this.f['currentPassword'].value,
      confirmPassWord: this.f['confirmPassword'].value
    };

    this.isLoading.set(true);

    this.passwordService.changePassword(payload).subscribe({
      next: (res: ApiResponse<any>) => {
        this.isLoading.set(false);
        if (res.isSuccess) {
          this.toastr.success(res.message,"Success");
          this.changePasswordForm.reset();
          this.isSubmitted.set(false);
        } else {
          this.toastr.error(res.message,"Error");
        }
      },
      error: (err: ApiResponse<any>) => {
        this.isLoading.set(false);
        this.toastr.error(err?.message ,"Error");
      }
    });
  }
}
