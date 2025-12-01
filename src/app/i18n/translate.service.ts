import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class TranslateService {
  private lang = 'en';
  private translations: Record<string, any> = {};
  private loaded$ = new BehaviorSubject<boolean>(false);
  // expose current language changes so pipes/components can react
  public lang$ = new BehaviorSubject<string>(this.lang);

  constructor(private http: HttpClient) {
    // Determine initial language: prefer saved value, else detect from browser locale, else default to 'en'
    const saved = sessionStorage.getItem('lang');
    const initial = saved || this.detectDefaultLang() || this.lang;
    this.lang = initial;
    // publish initial language
    this.lang$.next(this.lang);
    this.load(this.lang).subscribe();
  }

  use(lang: string): Observable<boolean> {
    if (lang === this.lang && Object.keys(this.translations).length) {
      return of(true);
    }
    this.lang = lang;
    // persist the chosen language
    try { sessionStorage.setItem('lang', lang); } catch (e) { /* ignore */ }
    // load translations and notify listeners when load succeeds
    return this.load(lang).pipe(
      tap((ok) => {
        if (ok) {
          this.lang$.next(lang);
        }
      })
    );
  }

  private load(lang: string): Observable<boolean> {
    return this.http.get<Record<string, any>>(`assets/i18n/${lang}.json`).pipe(
      tap((res) => {
        this.translations = res || {};
        this.loaded$.next(true);
      }),
      map(() => true),
      catchError((err) => {
        console.error('Error loading translations for lang:', lang, err);
        this.translations = {};
        this.loaded$.next(true);
        return of(false);
      })
    );
  }

  get(key: string): Observable<string | undefined> {
    const value = this.instant(key);
    if (value !== undefined) {
      return of(value);
    }
    // if not present yet, wait until loaded then return
    return this.loaded$.asObservable().pipe(
      map(() => this.instant(key))
    );
  }

  instant(key: string): string | undefined {
    if (!key) return undefined;
    const parts = key.split('.');
    let cur: any = this.translations;
    for (const p of parts) {
      if (cur && Object.prototype.hasOwnProperty.call(cur, p)) {
        cur = cur[p];
      } else {
        return undefined;
      }
    }
    return typeof cur === 'string' ? cur : undefined;
  }

  /**
   * Detect default language using browser settings (navigator.language / navigator.languages).
   * Maps language code to our available languages (e.g. 'it' -> 'it', else 'en').
   */
  private detectDefaultLang(): string | undefined {
    try {
      const nav: any = typeof navigator !== 'undefined' ? navigator : undefined;
      if (!nav) return undefined;
      const locale = (nav.languages && nav.languages[0]) || nav.language || nav.userLanguage;
      if (!locale) return undefined;
      const code = String(locale).split('-')[0].toLowerCase();
      // Extend mapping here if you add more languages
      if (code === 'it') return 'it';
      return 'en';
    } catch (e) {
      return undefined;
    }
  }
}
