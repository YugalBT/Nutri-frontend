import { Injectable } from '@angular/core';
import { HttpService } from '../../../shared/services/http.service';
import { Observable, Subject, tap } from 'rxjs';
import { ApiResponse } from '../../models/api-response';
import { DayList } from '../../models/day-list';
import { API_ENDPOINTS } from '../../constants/api-endpoints';

@Injectable({
  providedIn: 'root'
})
export class DayService {

  constructor(private http: HttpService) { }
  
  
    private dayChangedSubject = new Subject<void>();
    daysChanged$ = this.dayChangedSubject.asObservable();
  
    notifydaysChanged() {
      this.dayChangedSubject.next();
    }
  
    getDayDetails(payload: any): Observable<ApiResponse<DayList[]>> {
      return this.http.post<DayList[]>(API_ENDPOINTS.DAY.GET_ALL, payload);
    }
  
    createDays(payload: any): Observable<ApiResponse<any>> {
      return this.http.post<any>(API_ENDPOINTS.DAY.CREATE, payload).pipe(
        tap(res => { if (res.isSuccess) this.notifydaysChanged(); })
      );
    }
  
    updateDays(payload: any): Observable<ApiResponse<any>> {
      return this.http.post<any>(API_ENDPOINTS.DAY.UPDATE, payload).pipe(
        tap(res => { if (res.isSuccess) this.notifydaysChanged(); })
      );
    }
  
  
    activeInActive(dayId: string): Observable<ApiResponse<any>> {
      const url = `${API_ENDPOINTS.DAY.ACTIVE_INACTIVE}?DayId=${dayId}`;
      return this.http.post<any>(url, {}).pipe(
        tap(res => { if (res.isSuccess) this.notifydaysChanged(); })
      );;
    }
  
    deleteDays(dayId: string): Observable<ApiResponse<any>> {
      const url = `${API_ENDPOINTS.DAY.DELETE}?DayId=${dayId}`;
      return this.http.post<any>(url, {}).pipe(
        tap(res => { if (res.isSuccess) this.notifydaysChanged(); })
      );
    }
}
