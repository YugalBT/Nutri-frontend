import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ForgotPasswordService } from '../../../core/auth/forgot-password.service';
import { ToastService } from '../../../shared/services/toast.service';
import { SharedModule } from '../../../shared/shared.module';
import { TranslateService } from '../../../i18n/translate.service';
import { TranslatePipe } from '../../../i18n/translate.pipe';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  templateUrl: './forgot-password.component.html',
  imports: [SharedModule,TranslatePipe],
})
export class ForgotPasswordComponent {

  forgotForm!: FormGroup;
  companyCode: string = '';
  logoUrl: string = '';
  primaryColor: string = '#1d7e8b';

  constructor(private fb: FormBuilder,
              private forgotService: ForgotPasswordService,
              private router: Router,
              private toast:ToastService,
              private translate:TranslateService,
              private authService : AuthService,
              private route: ActivatedRoute,

            ) {}

  ngOnInit() {

    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });

    // this.route.paramMap.subscribe((params) => {
    //   this.companyCode = params.get('companyCode') || '';
    //   if (this.companyCode) {
    //     //this.loadHomePageContent();
    //   }else{
    //     this.toast.error('Invalid company code.');
    //     this.router.navigate(['/404']);}
    // });
  }

  // loadHomePageContent() {
  //   this.authService.getHomePageContent(this.companyCode).subscribe({
  //     next: (res) => {
  //       if (res?.isSuccess && res.data) {
  //         this.logoUrl = res.data.logo;
  //         this.primaryColor = res.data.primaryColor || '#1d7e8b';
  //       }
  //     },
  //     error: (err) => {
  //       this.toast.error(err?.message || 'Unable to load company info.');
  //     },
  //   });
  // }

  onSubmit() {
    if (this.forgotForm.invalid) {
      this.forgotForm.markAllAsTouched();
      this.toast.error('Please enter a valid email address.');
      return;
    }

    const payload = {
      ...this.forgotForm.value,
      code: this.companyCode, // send company code
    };

    this.forgotService.sendForgotPassword(payload).subscribe({
      next: (res) => {
        if (res?.isSuccess) {
          this.toast.success(res.message || 'Check your email for reset instructions.');
        } else {
          this.toast.error(res?.message || 'Something went wrong.');
        }
      },
      error: (err) => {
        this.toast.error(err?.message || 'Something went wrong.');
      },
    });
  }

}
