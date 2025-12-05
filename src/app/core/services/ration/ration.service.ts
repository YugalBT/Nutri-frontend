import { Injectable } from '@angular/core';
import { HttpService } from '../../../shared/services/http.service';
import { Observable, Subject } from 'rxjs';
import { ApiResponse } from '../../models/api-response';
import { RationList } from '../../models/ration-list';
import { API_ENDPOINTS } from '../../constants/api-endpoints';

@Injectable({
  providedIn: 'root'
})
export class RationService {

  constructor(private http: HttpService) {}
 
   
     private rationChangedSubject = new Subject<void>();
     rationChanged$ = this.rationChangedSubject.asObservable();
   
     notifyrationChanged() {
       this.rationChangedSubject.next();
     }
   
     getrationDetails(payload: any): Observable<ApiResponse<RationList[]>> {
       return this.http.post<RationList[]>(API_ENDPOINTS.RATION.GET_ALL, payload);
     }
   
     createration(payload: any): Observable<ApiResponse<any>> {
       return this.http.post<any>(API_ENDPOINTS.RATION.CREATE, payload);
     }
   
     updateration(payload: any): Observable<ApiResponse<any>> {
       return this.http.post<any>(API_ENDPOINTS.RATION.UPDATE, payload);
     }
   
     
     activeInActive(rationId: string): Observable<ApiResponse<any>> {
       const url = `${API_ENDPOINTS.RATION.ACTIVE_INACTIVE}?RationId=${rationId}`;
       return this.http.post<any>(url, {});
     }
 
     deleteration(rationId: string): Observable<ApiResponse<any>> {
       const url = `${API_ENDPOINTS.RATION.DELETE}?RationId=${rationId}`;
       return this.http.post<any>(url, {});
     }
}
