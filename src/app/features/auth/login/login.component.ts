// import { Component, OnInit } from '@angular/core';
// import { FormBuilder, FormGroup } from '@angular/forms';
// import { Store } from '@ngrx/store';
// import { TranslateService } from '../../../i18n/translate.service';
// import { TranslatePipe } from '../../../i18n/translate.pipe';
// import { Observable } from 'rxjs';
// import { ToastService } from '../../../shared/services/toast.service';
// import * as AuthActions from '../../../state/auth/auth.actions';
// import { selectAuthLoading } from '../../../state/auth/auth.selectors';
// import { SharedModule } from '../../../shared/shared.module';
// import { ICONS } from '../../../shared/svgfiles/svgicons';
// import { CustomValidators } from '../../../core/helpers/validators';
// import { AuthService } from '../../../core/auth/auth.service';
// import { ActivatedRoute, Router } from '@angular/router';




// @Component({
//   selector: 'app-login',
//   standalone: true,
//   templateUrl: './login.component.html',
//   styleUrls: ['./login.component.css'],
//   imports: [SharedModule, TranslatePipe]
// })
// export class LoginComponent implements OnInit {
//   form: FormGroup;
//   icons = ICONS;
//   loading$: Observable<boolean>;
//   currentLang = 'en';
//   // companyCode: string = '';
//   // logoUrl: string = '';
//   // primaryColor: string = '#1d7e8b';
//   constructor(private fb: FormBuilder, private store: Store, private toast: ToastService,
//      private translate: TranslateService, private authService: AuthService, private router: Router, private route: ActivatedRoute) {
//     this.form = this.fb.group({
//       username: ['', [CustomValidators.required()]],
//       password: ['', [CustomValidators.required()]]
//     });

//     this.loading$ = this.store.select(selectAuthLoading);

//   }
//   ngOnInit() {
//     // this.route.paramMap.subscribe(params => {
//     //   this.companyCode = params.get('companyCode') || '';
//     //   // if (this.companyCode) {
//     //   //   this.loadHomePageContent();
//     //   // }
//     // });
//     this.changeLanguage(this.currentLang)
//   }


//   onSubmit() {
//     if (this.form.invalid) {
//       this.form.markAllAsTouched();
//       this.toast.error(this.translate.instant('auth.fillRequired') || 'Please fill all required fields');
//       return;
//     }



//     let username = (this.form.value.username || '').trim();
//     let password = (this.form.value.password || '').trim();

//     this.form.patchValue(
//       { username, password },
//       { emitEvent: false }
//     );
//     this.store.dispatch(AuthActions.login({ username, password }));
//   }


//   showPassword: boolean = false;
//   togglePassword() {
//     this.showPassword = !this.showPassword;
//   }


//   changeLanguage(lang: string) {
//     if (!lang) return;
//     this.currentLang = lang;
//     localStorage.setItem('lang', lang);
//     this.translate.use(lang).subscribe();
//   }

  
//   // loadHomePageContent() {
//   //   this.authService.getHomePageContent(this.companyCode).subscribe({
//   //     next: (res) => {
//   //       if (res?.isSuccess && res.data) {
//   //         this.logoUrl = res.data.logo;
//   //         this.primaryColor = res.data.primaryColor || '#1d7e8b';
//   //         sessionStorage.setItem('companyInfo', JSON.stringify(res.data));
//   //       } else {
//   //         this.toast.error(res?.message);
//   //       }
//   //     },
//   //     error: (err) => {
//   //       this.toast.error(err?.message);
//   //     }
//   //   });
//   // }




//   // applyTheme(data: any) {
//   //   this.logoUrl = data.logo;
//   //   document.documentElement.style.setProperty('--primaryColor', data.primaryColor || '#1d7e8b');
//   //   document.documentElement.style.setProperty('--secondaryColor', data.secondaryColor || '#F4F5F9');


//   //   const favicon: any = document.querySelector("link[rel~='icon']") || document.createElement('link');
//   //   favicon.rel = 'icon';
//   //   favicon.href = data.logo;
//   //   document.head.appendChild(favicon);
//   //   document.title = data.companyName || 'App';
//   // }


// }
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { LocalizationService } from '../../../core/services/localization/localization.service';
import { LanguageList } from '../../../core/models/language-list';
import { selectAuthLoading } from '../../../state/auth/auth.selectors';
import * as AuthActions from '../../../state/auth/auth.actions';

import { TranslatePipe } from '../../../i18n/translate.pipe';
import { SharedModule } from '../../../shared/shared.module';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [SharedModule, TranslatePipe]
})
export class LoginComponent implements OnInit {

  form!: FormGroup;
  loading$!: Observable<boolean>;
  showPassword = false;

  /** 🌍 Language support */
  languages: LanguageList[] = [];
  currentLang = 'en';

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private localizationService: LocalizationService
  ) {}

  ngOnInit(): void {

    // 🔹 Build login form
    this.form = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });

    this.loading$ = this.store.select(selectAuthLoading);

    // 🔹 Load languages for dropdown
    this.localizationService.getAllLanguages().subscribe(res => {
      this.languages = res?.data ?? [];
    });

    // 🔹 Initialize language (default EN)
    this.localizationService.initLanguage().subscribe(() => {
      this.currentLang = this.localizationService.getCurrentLanguage();
    });
  }

get currentLanguageName(): string {

  if (!this.currentLang) {
    return 'Select Language';
  }

  const lang = this.languages.find(
    l => l.languageCode === this.currentLang
  );

  return lang?.languageName || 'Select Language';
}

  // 🔥 Change language
  changeLanguage(lang: string): void {
    if (!lang) return;
    this.localizationService.changeLanguage(lang).subscribe(() => {
      this.currentLang = lang.toLowerCase();
    });
  }

  // 🔐 Login submit
  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.store.dispatch(AuthActions.login(this.form.value));
  }

  // 👁 Toggle password visibility
  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }
}
