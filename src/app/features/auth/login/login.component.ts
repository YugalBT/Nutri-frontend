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

  /** Language support */
  languages: LanguageList[] = [];
  currentLang = 'it';

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private localizationService: LocalizationService
  ) {}

  ngOnInit(): void {

    // Build login form
    this.form = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });

    this.loading$ = this.store.select(selectAuthLoading);

    // Load languages for dropdown
    this.localizationService.getAllLanguages().subscribe(res => {
      this.languages = res?.data ?? [];
    });

    //  Initialize language (default EN)
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
