import { Injectable } from '@angular/core';
import { HttpService } from '../../../../shared/services/http.service';
import { Observable, Subject, tap } from 'rxjs';
import { ApiResponse } from '../../../models/api-response';
import { TemplateList } from '../../../models/template-builder/template-list';
import { API_ENDPOINTS } from '../../../constants/api-endpoints';

@Injectable({
  providedIn: 'root'
})
export class ManageTemplateService {

  constructor(private http: HttpService) { }


  private templateChangedSubject = new Subject<void>();
  templatesChanged$ = this.templateChangedSubject.asObservable();

  templatesChanged() {
    this.templateChangedSubject.next();
  }

  gettemplateDetails(payload: any): Observable<ApiResponse<any>> {
    return this.http.post<TemplateList[]>(API_ENDPOINTS.Template.GET_ALL, payload);
  }

  createTemplate(payload: any): Observable<ApiResponse<any>> {
    return this.http.post<any>(API_ENDPOINTS.Template.CREATE, payload).pipe(
      tap(res => { if (res.isSuccess) this.templatesChanged(); })
    );
  }

  updateTemplate(payload: any): Observable<ApiResponse<any>> {
    return this.http.post<any>(API_ENDPOINTS.Template.UPDATE, payload).pipe(
      tap(res => { if (res.isSuccess) this.templatesChanged(); })
    );
  }


  activeInActive(templateId: string): Observable<ApiResponse<any>> {
    const url = `${API_ENDPOINTS.Template.ACTIVE_INACTIVE}?id=${templateId}`;
    return this.http.post<any>(url, {}).pipe(
      tap(res => { if (res.isSuccess) this.templatesChanged(); })
    );;
  }

  deleteTemplate(templateId: string): Observable<ApiResponse<any>> {
    const url = `${API_ENDPOINTS.Template.DELETE}?id=${templateId}`;
    return this.http.post<any>(url, {}).pipe(
      tap(res => { if (res.isSuccess) this.templatesChanged(); })
    );
  }
}
