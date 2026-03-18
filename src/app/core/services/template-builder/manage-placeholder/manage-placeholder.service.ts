import { Injectable } from '@angular/core';
import { HttpService } from '../../../../shared/services/http.service';
import { Observable, Subject, tap } from 'rxjs';
import { ApiResponse } from '../../../models/api-response';
import { API_ENDPOINTS } from '../../../constants/api-endpoints';
import { TemplatePlaceholderList } from '../../../models/template-builder/template-placeholder-list';

@Injectable({
  providedIn: 'root'
})
export class ManagePlaceholderService {

  constructor(private http: HttpService) { }


  private placeholderChangedSubject = new Subject<void>();
  placeholdersChanged$ = this.placeholderChangedSubject.asObservable();

  placeholdersChanged() {
    this.placeholderChangedSubject.next();
  }

  getPlaceholderDetails(payload: any): Observable<ApiResponse<any>> {
    return this.http.post<TemplatePlaceholderList[]>(API_ENDPOINTS.PLACEHOLDER.GET_ALL, payload);
  }

  createPlaceholder(payload: any): Observable<ApiResponse<any>> {
    return this.http.post<any>(API_ENDPOINTS.PLACEHOLDER.CREATE, payload).pipe(
      tap(res => { if (res.isSuccess) this.placeholdersChanged(); })
    );
  }

  updatePlaceholder(payload: any): Observable<ApiResponse<any>> {
    return this.http.post<any>(API_ENDPOINTS.PLACEHOLDER.UPDATE, payload).pipe(
      tap(res => { if (res.isSuccess) this.placeholdersChanged(); })
    );
  }


  activeInActive(id: string): Observable<ApiResponse<any>> {
    const url = `${API_ENDPOINTS.PLACEHOLDER.ACTIVE_INACTIVE}?id=${id}`;
    return this.http.post<any>(url, {}).pipe(
      tap(res => { if (res.isSuccess) this.placeholdersChanged(); })
    );;
  }

  deletePlaceholder(id: string): Observable<ApiResponse<any>> {
    const url = `${API_ENDPOINTS.PLACEHOLDER.DELETE}?id=${id}`;
    return this.http.post<any>(url, {}).pipe(
      tap(res => { if (res.isSuccess) this.placeholdersChanged(); })
    );
  }
}
