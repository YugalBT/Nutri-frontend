import { Injectable } from '@angular/core';
import { HttpService } from '../../../shared/services/http.service';
import { Subject } from 'rxjs/internal/Subject';
import { LanguageList } from '../../models/language-list';
import { API_ENDPOINTS } from '../../constants/api-endpoints';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../models/api-response';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {

  constructor(private http: HttpService) { }
  params = new HttpParams();
  private languageChangedSubject = new Subject<void>();
  languagesChanged$ = this.languageChangedSubject.asObservable();

  notifylanguageChanged() {
    this.languageChangedSubject.next();
  }

  getLanguagesDetails(payload: any): Observable<ApiResponse<LanguageList[]>> {
    return this.http.post<LanguageList[]>(API_ENDPOINTS.LANGUAGE.GET_ALL, payload);
  }

  createLanguages(payload: any): Observable<ApiResponse<any>> {
    return this.http.post<any>(API_ENDPOINTS.LANGUAGE.CREATE, payload);
  }

  updateLanguages(payload: any): Observable<ApiResponse<any>> {
    return this.http.post<any>(API_ENDPOINTS.LANGUAGE.UPDATE, payload);
  }


  activeInActive(userId: string): Observable<ApiResponse<any>> {
    const url = `${API_ENDPOINTS.LANGUAGE.ACTIVE_INACTIVE}?LanguageId=${userId}`;
    return this.http.post<any>(url, {});
  }

  deleteLanguages(userId: string): Observable<ApiResponse<any>> {
    const url = `${API_ENDPOINTS.LANGUAGE.DELETE}?LanguageId=${userId}`;
    return this.http.post<any>(url, {});
  }


// language.service.ts
exportLanguage(culture?: string) {
  const url = culture
    ? `${API_ENDPOINTS.LANGUAGE.Export}?culture=${encodeURIComponent(culture)}`
    : API_ENDPOINTS.LANGUAGE.Export;

  // T = string (Base64)
  return this.http.get<string>(url);
}

importLanguage(payload: FormData) {
  return this.http.post<any>(
    API_ENDPOINTS.LANGUAGE.Import,
    payload
  );
}

getAllLanguages(): Observable<ApiResponse<LanguageList[]>> {
  return this.http.get<LanguageList[]>(API_ENDPOINTS.COMMON_API.GET_Language_LIST);
}

}