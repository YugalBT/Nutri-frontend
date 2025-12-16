import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ChangePasswordService } from '../../../core/services/change-password/change-password.service';
import { ApiResponse } from '../../../core/models/api-response';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent implements OnInit {

  resetForm!: FormGroup;
  showPassword = false;
  isSubmitted = false;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private toast: ToastrService,
    private passwordService: ChangePasswordService
  ) {}

  ngOnInit(): void {
    this.resetForm = this.fb.group(
      {
        newPassword: this.fb.control('', {
          validators: [Validators.required, Validators.minLength(8)]
        }),
        confirmPassword: this.fb.control('', {
          validators: [Validators.required]
        })
      },
      { validators: this.passwordMatchValidator }
    );
  }

  // 🔐 Password match validator
  passwordMatchValidator(form: FormGroup) {
    const password = form.get('newPassword')?.value;
    const confirm = form.get('confirmPassword')?.value;
    return password === confirm ? null : { passwordMismatch: true };
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    this.isSubmitted = true;

    if (this.resetForm.invalid) {
      this.toast.error('Please fix validation errors.');
      return;
    }

    const payload = {
      newPassword: this.resetForm.value.newPassword
    };

    this.isLoading = true;

    this.passwordService.changePassword(payload).subscribe({
      next: (res: ApiResponse<any>) => {
        this.isLoading = false;
        if (res.isSuccess) {
          this.toast.success(res.message || 'Password reset successful');
          this.resetForm.reset();
          this.router.navigate(['/login']);
        } else {
          this.toast.error(res.message || 'Something went wrong');
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.toast.error(err?.message || 'Server error');
      }
    });
  }
}
