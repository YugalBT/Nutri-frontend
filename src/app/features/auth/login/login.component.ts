import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

import { LocalizationService } from '../../../core/services/localization/localization.service';
import { LanguageList } from '../../../core/models/language-list';
import { selectAuthLoading, selectAuthUser } from '../../../state/auth/auth.selectors';
import * as AuthActions from '../../../state/auth/auth.actions';
import { BrandingService } from '../../../shared/services/branding.service';

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
  user$!: Observable<any>;
  showPassword = false;

  /** Language support */
  languages: LanguageList[] = [];
  currentLang = 'it';
  
  /** Supplier branding */
  isSupplier = false;
  rightHeadingKey = 'right.heading';
  rightDescriptionKey = 'right.description';
  rightPoint1Key = 'right.point1';
  rightPoint2Key = 'right.point2';
  rightPoint3Key = 'right.point3';

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private localizationService: LocalizationService,
    private brandingService: BrandingService,
    private router: Router
  ) {
    // Initialize branding immediately (for URL-based detection)
    this.brandingService.initialize();
  }

  ngOnInit(): void {

    // Check if URL contains /supplier
    this.checkIfSupplier();

    // Build login form
    this.form = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });

    this.loading$ = this.store.select(selectAuthLoading);
    this.user$ = this.store.select(selectAuthUser);

    // Subscribe to user changes to update supplier keys if needed
    this.user$.subscribe(user => {
      if (user?.supplierDetails && !this.isSupplier) {
        this.switchToSupplierKeys();
      }
    });

    // Load languages for dropdown
    this.localizationService.getAllLanguages().subscribe(res => {
      this.languages = res?.data ?? [];
    });

    //  Initialize language (default EN)
    this.localizationService.initLanguage().subscribe(() => {
      this.currentLang = this.localizationService.getCurrentLanguage();
    });
  }

  /** Check if current URL is supplier login */
  private checkIfSupplier(): void {
    const currentUrl = this.router.url.toLowerCase();
    if (currentUrl.includes('/supplier/login')) {
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

get currentLanguageName(): string {

  if (!this.currentLang) {
    return 'Select Language';
  }

  const lang = this.languages.find(
    l => l.languageCode === this.currentLang
  );

  return lang?.languageName || 'Select Language';
}

  get forgotPasswordRoute(): string {
    return this.brandingService.getAuthRoute('forgot-password');
  }

  //  Change language
  changeLanguage(lang: string): void {
    if (!lang) return;
    this.localizationService.changeLanguage(lang).subscribe(() => {
      this.currentLang = lang.toLowerCase();
    });
  }

  //  Login submit
  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.store.dispatch(AuthActions.login(this.form.value));
  }

  //  Toggle password visibility
  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }
}
