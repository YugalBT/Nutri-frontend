import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ForgotPasswordService } from '../../../core/auth/forgot-password.service';
import { ToastService } from '../../../shared/services/toast.service';
import { SharedModule } from '../../../shared/shared.module';
import { TranslatePipe } from '../../../i18n/translate.pipe';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [SharedModule, TranslatePipe],
  templateUrl: './forgot-password.component.html',
})
export class ForgotPasswordComponent implements OnInit {

  forgotForm!: FormGroup; 

  constructor(
    private fb: FormBuilder,
    private forgotService: ForgotPasswordService,
    private router: Router,
    private toast: ToastService
  ) {}

  ngOnInit(): void {

    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  onSubmit(): void {
    if (this.forgotForm.invalid) {
      this.forgotForm.markAllAsTouched();
      this.toast.error('Please enter a valid email address.');
      return;
    }

    const payload = this.forgotForm.value;

    this.forgotService.sendForgotPassword(payload).subscribe({
      next: (res) => {
        if (res?.isSuccess) {
          this.toast.success(
            res.message
          );
          this.forgotForm.reset();
        } else {
          this.toast.error(res?.message);
        }
      },
      error: (err) => {
        this.toast.error(err?.message);
      },
    });
  }
}
