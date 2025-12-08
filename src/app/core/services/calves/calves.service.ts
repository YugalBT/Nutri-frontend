import { Injectable } from '@angular/core';
import { HttpService } from '../../../shared/services/http.service';
import { Observable, Subject, tap } from 'rxjs';
import { ApiResponse } from '../../models/api-response';
import { CalvesList } from '../../models/calves-list';
import { API_ENDPOINTS } from '../../constants/api-endpoints';

@Injectable({
  providedIn: 'root'
})
export class CalvesService {

   constructor(private http: HttpService) { }
    
    
      private calveChangedSubject = new Subject<void>();
      calvesChanged$ = this.calveChangedSubject.asObservable();
    
      notifycalvesChanged() {
        this.calveChangedSubject.next();
      }
    
      getCalveDetails(payload: any): Observable<ApiResponse<CalvesList[]>> {
        return this.http.post<CalvesList[]>(API_ENDPOINTS.CALVES.GET_ALL, payload);
      }
    
      createCalves(payload: any): Observable<ApiResponse<any>> {
        return this.http.post<any>(API_ENDPOINTS.CALVES.CREATE, payload).pipe(
          tap(res => { if (res.isSuccess) this.notifycalvesChanged(); })
        );
      }
    
      updateCalves(payload: any): Observable<ApiResponse<any>> {
        return this.http.post<any>(API_ENDPOINTS.CALVES.UPDATE, payload).pipe(
          tap(res => { if (res.isSuccess) this.notifycalvesChanged(); })
        );
      }
    
    
      activeInActive(calvesId: string): Observable<ApiResponse<any>> {
        const url = `${API_ENDPOINTS.CALVES.ACTIVE_INACTIVE}?calvesId=${calvesId}`;
        return this.http.post<any>(url, {}).pipe(
          tap(res => { if (res.isSuccess) this.notifycalvesChanged(); })
        );;
      }
    
      deleteCalves(calvesId: string): Observable<ApiResponse<any>> {
        const url = `${API_ENDPOINTS.CALVES.DELETE}?calvesId=${calvesId}`;
        return this.http.post<any>(url, {}).pipe(
          tap(res => { if (res.isSuccess) this.notifycalvesChanged(); })
        );
      }
}
