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

  /** Supplier branding */
  isSupplier = false;
  rightHeadingKey = 'right.heading';
  rightDescriptionKey = 'right.description';
  rightPoint1Key = 'right.point1';
  rightPoint2Key = 'right.point2';
  rightPoint3Key = 'right.point3';

  constructor(
    private fb: FormBuilder,
    private forgotService: ForgotPasswordService,
    private router: Router,
    private toast: ToastService,
    private route: ActivatedRoute,
    private brandingService: BrandingService,
  ) {
    // Initialize branding immediately (for URL-based detection)
    this.brandingService.initialize();
  }

  ngOnInit(): void {

    // Check if URL contains /supplier
    this.checkIfSupplier();

    this.route.queryParamMap.subscribe(params => {
      this.token = params.get('token');
      this.isResetMode = !!this.token;
    });
     this.initForms();
  }

  /** Check if current URL is supplier */
  private checkIfSupplier(): void {
    const currentUrl = this.router.url.toLowerCase();
    if (currentUrl.includes('/supplier/')) {
      this.switchToSupplierKeys();
    }
  }

  /** Switch to supplier translation keys */
  private switchToSupplierKeys(): void {
    this.isSupplier = true;
    this.rightHeadingKey = 'supplier.right.heading';
    this.rightDescriptionKey = 'supplier.right.description';
    this.rightPoint1Key = 'supplier.right.point1';
    this.rightPoint2Key = 'supplier.right.point2';
    this.rightPoint3Key = 'supplier.right.point3';
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

