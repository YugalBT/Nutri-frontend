import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import { TranslateService } from '../../../i18n/translate.service';
import { TranslatePipe } from '../../../i18n/translate.pipe';
import { Observable } from 'rxjs';
import { ToastService } from '../../../shared/services/toast.service';
import * as AuthActions from '../../../state/auth/auth.actions';
import { selectAuthLoading } from '../../../state/auth/auth.selectors';
import { SharedModule } from '../../../shared/shared.module';
import { ICONS } from '../../../shared/svgfiles/svgicons';
import { CustomValidators } from '../../../core/helpers/validators';
import { AuthService } from '../../../core/auth/auth.service';
import { ActivatedRoute, Router } from '@angular/router';




@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [SharedModule, TranslatePipe]
})
export class LoginComponent implements OnInit {
  form: FormGroup;
  icons = ICONS;
  loading$: Observable<boolean>;
  companyCode: string = '';
  logoUrl: string = '';
  primaryColor: string = '#1d7e8b';
  constructor(private fb: FormBuilder, private store: Store, private toast: ToastService, private translate: TranslateService, private authService: AuthService, private router: Router, private route: ActivatedRoute) {
    this.form = this.fb.group({
      username: ['', [CustomValidators.required()]],
      password: ['', [CustomValidators.required()]]
    });

    this.loading$ = this.store.select(selectAuthLoading);

  }
  ngOnInit() {
  this.route.paramMap.subscribe(params => {
    this.companyCode = params.get('companyCode') || '';
    if (this.companyCode) {
      this.loadHomePageContent();
    }
  });
}








  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.error(this.translate.instant('auth.fillRequired') || 'Please fill all required fields');
      return;
    }



    const { username, password } = this.form.value;
    this.store.dispatch(AuthActions.login({ username, password, companyCode: this.companyCode }));
  }




  showPassword: boolean = false;
  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  loadHomePageContent() {
    this.authService.getHomePageContent(this.companyCode).subscribe({
      next: (res) => {
        if (res?.isSuccess && res.data) {
          this.logoUrl = res.data.logo;
          this.primaryColor = res.data.primaryColor || '#1d7e8b';
          localStorage.setItem('companyInfo', JSON.stringify(res.data));
        } else {
          this.toast.error(res?.message);
        }
      },
      error: (err) => {
        this.toast.error(err?.message);
      }
    });
  }




  applyTheme(data: any) {
    this.logoUrl = data.logo;
    document.documentElement.style.setProperty('--primaryColor', data.primaryColor || '#1d7e8b');
    document.documentElement.style.setProperty('--secondaryColor', data.secondaryColor || '#FFAA00');


    const favicon: any = document.querySelector("link[rel~='icon']") || document.createElement('link');
    favicon.rel = 'icon';
    favicon.href = data.logo;
    document.head.appendChild(favicon);
    document.title = data.companyName || 'App';
  }


}