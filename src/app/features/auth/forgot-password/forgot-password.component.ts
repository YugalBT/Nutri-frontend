import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ForgotPasswordService } from '../../../core/auth/forgot-password.service';
import { ToastService } from '../../../shared/services/toast.service';
import { SharedModule } from '../../../shared/shared.module';
import { TranslatePipe } from '../../../i18n/translate.pipe';
import { ActivatedRoute } from '@angular/router';
import { BrandingService } from '../../../shared/services/branding.service';


@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [SharedModule, TranslatePipe],
  templateUrl: './forgot-password.component.html',
})
export class ForgotPasswordComponent implements OnInit {

  emailForm!: FormGroup;
  resetForm!: FormGroup;
  newPasswordShow = false;
  showPassword = false;
  token: string | null = null;
  isResetMode = false;
  isSubmitted = false;

  constructor(
    private fb: FormBuilder,
    private forgotService: ForgotPasswordService,
    private router: Router,
    private toast: ToastService,
    private route: ActivatedRoute,
    private brandingService: BrandingService,
  ) {}

  ngOnInit(): void {

    this.route.queryParamMap.subscribe(params => {
      this.token = params.get('token');
      this.isResetMode = !!this.token;
    });
     this.initForms();
  }

 initForms() {
  this.emailForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  this.resetForm = this.fb.group(
    {
      passWord: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).+$/)
        ]
      ],
      confirmPassWord: ['', Validators.required]
    },
    { validators: this.passwordMatch }
  );
}


passwordMatch(group: FormGroup) {
  const password = group.get('passWord')?.value;
  const confirm = group.get('confirmPassWord')?.value;

  return password === confirm ? null : { passwordMismatch: true };
}

get loginRoute(): string {
  return this.brandingService.getAuthRoute('login');
}


  // ===============================
  // SEND RESET LINK
  // ===============================
  sendResetLink() {
    if (this.emailForm.invalid) {
      this.toast.error('Please enter a valid email');
      return;
    }

    this.forgotService.sendForgotPassword(this.emailForm.value)
      .subscribe({
        next: (res) => {
          this.toast.success(res.message);
        },
        error: (err) => {
          this.toast.error(err?.message || 'Something went wrong');
        }
      });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleNewPassword() {
    this.newPasswordShow = !this.newPasswordShow;
  }
  // ===============================
  // RESET PASSWORD
  // ===============================
resetPassword() {
  this.isSubmitted = true;

  if (this.resetForm.invalid) {
    return;
  }

  const payload = {
    token: this.token!,
    password: this.resetForm.value.passWord
  };

  this.forgotService.verifyForgotPassword(payload).subscribe({
    next: (res) => {
      this.toast.success(res?.message);
      this.router.navigate([this.loginRoute]);
    },
    error: (err) => {
      this.toast.error(err?.message || 'Invalid or expired link');
    }
  });
}

}

