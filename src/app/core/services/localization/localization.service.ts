import { Injectable } from '@angular/core';
import { TranslateService } from '../../../i18n/translate.service';
import { ApiResponse } from '../../../core/models/api-response';
import { LanguageList } from '../../../core/models/language-list';
import { API_ENDPOINTS } from '../../../core/constants/api-endpoints';
import { HttpService } from '../../../shared/services/http.service';
import { HttpBackend } from '@angular/common/http';
import { HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LocalizationService {

  private readonly STORAGE_KEY = 'lang';
  private readonly DEFAULT_LANG = 'en';

  private currentLang: string = this.DEFAULT_LANG;
  private currentLang$ = new BehaviorSubject<string>(this.DEFAULT_LANG);
  constructor(
    private translate: TranslateService,
    private http: HttpService,
    private handler: HttpBackend
  ) { }

  getAllLanguages(): Observable<ApiResponse<LanguageList[]>> {
    return this.http.get<any>(
      API_ENDPOINTS.COMMON_API.GET_Language_LIST,
      {}
    );
  }

  initLanguage(): Observable<any> {
    const savedLang =
      (localStorage.getItem(this.STORAGE_KEY) || this.DEFAULT_LANG).toLowerCase();

    this.currentLang = savedLang;
    this.currentLang$.next(this.currentLang);
    return this.loadLanguageFromApi(savedLang);
  }

  changeLanguage(lang: string): Observable<any> {

    if (!lang) {
      lang = this.currentLang || this.DEFAULT_LANG;
    }

    lang = lang.toLowerCase();

    if (lang === this.currentLang) {
      return of(true);
    }

    this.currentLang = lang;
    localStorage.setItem(this.STORAGE_KEY, lang);
    this.currentLang$.next(lang);
    return this.loadLanguageFromApi(lang);

    // this.currentLang = lang;
    // localStorage.setItem(this.STORAGE_KEY, lang);

    // return this.loadLanguageFromApi(lang);
  }


  private loadLanguageFromApi(lang: string): Observable<any> {

    const culture = encodeURIComponent(lang || 'en');
    const url = `${API_ENDPOINTS.LANGUAGE.LanguageByCulture}?request=${culture}`;

    return this.http.post<any>(url, null).pipe(
      tap(res => {
        if (res?.isSuccess && res.data) {
          this.translate.setTranslations(res.data);
        }
      })
    );
  }
  getCurrentLanguage$(): Observable<string> {
    return this.currentLang$.asObservable();
  }

  getCurrentLanguage(): string {
    return this.currentLang;
  }
}
