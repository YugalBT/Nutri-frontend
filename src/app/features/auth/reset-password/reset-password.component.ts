import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ChangePasswordService } from '../../../core/services/change-password/change-password.service';
import { ApiResponse } from '../../../core/models/api-response';
import { CommonModule } from '@angular/common';
import { ROUTE_CONST } from '../../../core/constants/route.constants';
import { TranslatePipe } from '../../../i18n/translate.pipe';
import { updateFirstLogin } from '../../../state/auth/auth.actions';
import { Store } from '@ngrx/store';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css',
})
export class ResetPasswordComponent implements OnInit {
  resetForm!: FormGroup;
  showPassword = false;
  oldPasswordShow = false;
  newPasswordShow = false;
  isSubmitted = false;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private toast: ToastrService,
    private passwordService: ChangePasswordService,
    private store: Store,
  ) {}

  ngOnInit(): void {
    this.resetForm = this.fb.group(
      {
        passWord: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/),
          ],
        ],

        oldPassWord: ['', [Validators.required]],
        confirmPassWord: this.fb.control('', {
          validators: [Validators.required],
        }),
      },
      { validators: this.passwordMatchValidator.bind(this) },
    );
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('passWord')?.value;
    const confirm = form.get('confirmPassWord')?.value;
    return password === confirm ? null : { passwordMismatch: true };
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }
  toggleOldPassword() {
    this.oldPasswordShow = !this.oldPasswordShow;
  }

  toggleNewPassword() {
    this.newPasswordShow = !this.newPasswordShow;
  }

  onSubmit() {
    this.isSubmitted = true;
    this.resetForm.markAllAsTouched();
    if (this.resetForm.invalid) {
      this.toast.warning('Please Enter Valid Paswwords.');
      return;
    }

    const payload = {
      passWord: this.resetForm.value.passWord,
      oldPassWord: this.resetForm.value.oldPassWord,
      confirmPassWord: this.resetForm.value.confirmPassWord,
    };

    this.isLoading = true;

    this.passwordService.changePassword(payload).subscribe({
      next: (res: ApiResponse<any>) => {
        this.isLoading = false;
       if (res.isSuccess) {
  this.toast.success(res?.message);

  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const updatedUser = {
    ...storedUser,
    isFirstLogin: true,
  };
  localStorage.setItem('user', JSON.stringify(updatedUser));

  this.store.dispatch(updateFirstLogin({ isFirstLogin: true }));

  this.resetForm.reset();
  this.resetForm.setErrors(null);
  Object.keys(this.resetForm.controls).forEach(key => {
    const control = this.resetForm.get(key);
    control?.setErrors(null);
    control?.markAsPristine();
    control?.markAsUntouched();
  });

  this.isSubmitted = false;
  this.isLoading = false;

  // ✅ navigate AFTER reset
  this.router.navigate([ROUTE_CONST.DASHBOARD], { replaceUrl: true });
}
 else {
          this.toast.error(res.message);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.toast.error(err?.message);
      },
    });
  }
}
