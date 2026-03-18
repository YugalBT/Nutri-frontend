import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { API_ENDPOINTS } from '../core/constants/api-endpoints';
import { HttpService } from '../shared/services/http.service';

interface LocalizationApiResponse {
  isSuccess: boolean;
  data: Record<string, string>;
  message: string;
  totalRecords: number;
}

@Injectable({ providedIn: 'root' })
export class TranslateService {

  private lang = 'it';
  private translations: Record<string, string> = {};

  private loaded$ = new BehaviorSubject<boolean>(false);
  public lang$ = new BehaviorSubject<string>(this.lang);

  constructor(private http: HttpService) {
    const saved = localStorage.getItem('lang');
    this.lang = saved || this.detectDefaultLang() || 'it';

    this.lang$.next(this.lang);

    // 🔥 Initial load from backend
    this.load(this.lang).subscribe();
  }

  /**
   * Change language
   */
  use(lang: string): Observable<boolean> {
    if (lang === this.lang && Object.keys(this.translations).length) {
      return of(true);
    }

    this.lang = lang || 'it';

    try {
      localStorage.setItem('lang', this.lang);
    } catch {}

    return this.load(this.lang).pipe(
      tap(ok => {
        if (ok) {
          this.lang$.next(this.lang);
        }
      })
    );
  }

private load(lang: string): Observable<boolean> {
  return this.http
    .post<any>(
      API_ENDPOINTS.LANGUAGE.LanguageByCulture,
      { culture: lang || 'it' }
    )
    .pipe(
      tap(res => {
        if (res?.isSuccess && res.data) {
          this.translations = res.data;
        } else {
          this.translations = {};
        }
        this.loaded$.next(true);
      }),
      map(res => !!res?.isSuccess),
      catchError(err => {
        console.error('Localization API failed', err);
        this.translations = {};
        this.loaded$.next(true);
        return of(false);
      })
    );
}




  setTranslations(data: any) {
    this.translations = data;
    this.lang$.next(data); // Notify subscribers
  }

// translate.service.ts

instant(key: string): string {
  // Since your data is flat, we just look up the key directly.
  // If the key doesn't exist, we return the original key as a fallback.
  return this.translations && this.translations[key] ? this.translations[key] : key;
}
  /**
   * Instant translation (used by pipe)
   */
  // instant(key: string): string {
  //   if (!key) return key;
  //   return this.translations[key] ?? key;
  // }

  /**
   * Optional async get
   */
  get(key: string): Observable<string> {
    const value = this.instant(key);
    if (value !== key) {
      return of(value);
    }

    return this.loaded$.asObservable().pipe(
      map(() => this.instant(key))
    );
  }

  /**
   * Detect browser language
   */
  private detectDefaultLang(): string | undefined {
    try {
      const locale = navigator?.language || '';
      const code = locale.split('-')[0].toLowerCase();
      return code === 'it' ? 'it' : 'it';
    } catch {
      return 'it';
    }
  }
//   setTranslations(data: Record<string, string>): void {
//   this.translations = data || {};
//   this.loaded$.next(true);
//   this.lang$.next(this.lang);
// }
// setTranslations(translations: Record<string, string>) {
//   this.translations = translations;
//   this.loaded$.next(true);
// }


}
