import { Injectable } from '@angular/core';
import { HttpService } from '../../../shared/services/http.service';
import { Subject } from 'rxjs/internal/Subject';
import { LanguageList } from '../../models/language-list';
import { API_ENDPOINTS } from '../../constants/api-endpoints';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../models/api-response';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {

  constructor(private http: HttpService) { }

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
}
