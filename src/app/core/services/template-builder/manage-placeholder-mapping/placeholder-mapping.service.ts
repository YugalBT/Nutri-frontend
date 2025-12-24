import { Injectable } from '@angular/core';
import { HttpService } from '../../../../shared/services/http.service';
import { Observable, Subject, tap } from 'rxjs';
import { ApiResponse } from '../../../models/api-response';
import { API_ENDPOINTS } from '../../../constants/api-endpoints';
import { TemplatePlaceholderMappingList } from '../../../models/template-builder/template-placeholder-mapping-list';

@Injectable({
  providedIn: 'root'
})
export class PlaceholderMappingService {

  constructor(private http: HttpService) { }
  
  
    private placeholderMappingChangedSubject = new Subject<void>();
    placeholderMappingsChanged$ = this.placeholderMappingChangedSubject.asObservable();
  
    placeholderMappingsChanged() {
      this.placeholderMappingChangedSubject.next();
    }
  
    getPlaceholderMappingDetails(payload: any): Observable<ApiResponse<any>> {
      return this.http.post<TemplatePlaceholderMappingList[]>(API_ENDPOINTS.PLACEHOLDERS_MAPPING.GET_ALL, payload);
    }
  
    createPlaceholderMapping(payload: any): Observable<ApiResponse<any>> {
      return this.http.post<any>(API_ENDPOINTS.PLACEHOLDERS_MAPPING.CREATE, payload).pipe(
        tap(res => { if (res.isSuccess) this.placeholderMappingsChanged(); })
      );
    }
  
    updatePlaceholderMapping(payload: any): Observable<ApiResponse<any>> {
      return this.http.post<any>(API_ENDPOINTS.PLACEHOLDERS_MAPPING.UPDATE, payload).pipe(
        tap(res => { if (res.isSuccess) this.placeholderMappingsChanged(); })
      );
    }
  
  
    activeInActive(id: string): Observable<ApiResponse<any>> {
      const url = `${API_ENDPOINTS.PLACEHOLDERS_MAPPING.ACTIVE_INACTIVE}?id=${id}`;
      return this.http.post<any>(url, {}).pipe(
        tap(res => { if (res.isSuccess) this.placeholderMappingsChanged(); })
      );;
    }
  
    deletePlaceholderMapping(id: string): Observable<ApiResponse<any>> {
      const url = `${API_ENDPOINTS.PLACEHOLDERS_MAPPING.DELETE}?id=${id}`;
      return this.http.post<any>(url, {}).pipe(
        tap(res => { if (res.isSuccess) this.placeholderMappingsChanged(); })
      );
    }
}
