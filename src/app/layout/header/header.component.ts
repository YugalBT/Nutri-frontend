import { Component } from '@angular/core';
import { RouterLink } from "@angular/router";
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { selectAuthUser } from '../../state/auth/auth.selectors';
import { User } from '../../state/auth/auth.models';
import * as AuthActions from '../../state/auth/auth.actions';
import { TranslateService } from '../../i18n/translate.service';
import { TranslatePipe } from '../../i18n/translate.pipe';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, CommonModule, TranslatePipe],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {

  user$: Observable<User | null>;
  currentLang = 'en';

  constructor(private store: Store, private translate: TranslateService) {
    this.user$ = this.store.select(selectAuthUser);
    // initialize language from localStorage (if previously selected)
    const saved = localStorage.getItem('lang');
    if (saved) {
      this.currentLang = saved;
      this.translate.use(this.currentLang).subscribe();
    } else {
      this.translate.use(this.currentLang).subscribe();
    }
  }
 
  logout() {
    

    this.store.dispatch(AuthActions.logout());
  }

  changeLanguage(lang: string) {
    if (!lang) return;
    this.currentLang = lang;
    localStorage.setItem('lang', lang);
    this.translate.use(lang).subscribe();
  }
}
