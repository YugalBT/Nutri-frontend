import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ChangePasswordService } from '../../../core/services/change-password/change-password.service';
import { ApiResponse } from '../../../core/models/api-response';
import { CommonModule } from '@angular/common';
import { ROUTE_CONST } from '../../../core/constants/route.constants';

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
  oldPasswordShow =false;
  newPasswordShow =false;
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
        passWord: [
          '',
          [
            Validators.required,
            Validators.minLength(6),
          ]
        ],
        
        oldPassWord: [
          '',
          [
            Validators.required,
          ]
        ],
        confirmPassWord: this.fb.control('', {
          validators: [Validators.required]
        })
      },
      { validators: this.passwordMatchValidator.bind(this) }
    );
  }


  passwordMatchValidator(form: FormGroup) {
    debugger;
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
    debugger;
    this.isSubmitted = true;
    this.resetForm.markAllAsTouched();
    if (this.resetForm.invalid) {
      this.toast.warning('Please Enter Valid Paswwords.');
      return;
    }

    const payload = {
      passWord: this.resetForm.value.passWord,
      oldPassWord: this.resetForm.value.oldPassWord,
      confirmPassWord: this.resetForm.value.confirmPassWord
    };

    this.isLoading = true;

    this.passwordService.changePassword(payload).subscribe({
      next: (res: ApiResponse<any>) => {
        this.isLoading = false;
        if (res.isSuccess) {
          this.toast.success(res?.message);
          this.resetForm.reset();
         this.router.navigate([ROUTE_CONST.DASHBOARD]);
        } else {
          this.toast.error(res.message);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.toast.error(err?.message);
      }
    });
  }
}
