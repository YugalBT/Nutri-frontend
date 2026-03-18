import { Injectable } from '@angular/core';
import { HttpService } from '../../../shared/services/http.service';
import { Observable, Subject, tap } from 'rxjs';
import { ApiResponse } from '../../models/api-response';
import { API_ENDPOINTS } from '../../constants/api-endpoints';
import { KpiList } from '../../models/day-list';

@Injectable({
  providedIn: 'root'
})
export class KpiService {

  constructor(private http: HttpService) { }
  
  
    private kpiChangedSubject = new Subject<void>();
    kpisChanged$ = this.kpiChangedSubject.asObservable();
  
    notifykpisChanged() {
      this.kpiChangedSubject.next();
    }
  
    getkpiDetails(payload: any): Observable<ApiResponse<KpiList[]>> {
      return this.http.post<KpiList[]>(API_ENDPOINTS.KPI.GET_ALL, payload);
    }
  
    createkpis(payload: any): Observable<ApiResponse<any>> {
      return this.http.post<any>(API_ENDPOINTS.KPI.CREATE, payload).pipe(
        tap(res => { if (res.isSuccess) this.notifykpisChanged(); })
      );
    }
  
    updateKpis(payload: any): Observable<ApiResponse<any>> {
      return this.http.post<any>(API_ENDPOINTS.KPI.UPDATE, payload).pipe(
        tap(res => { if (res.isSuccess) this.notifykpisChanged(); })
      );
    }
  
  
    activeInActive(Kpiid: string): Observable<ApiResponse<any>> {
      const url = `${API_ENDPOINTS.KPI.ACTIVE_INACTIVE}?Kpiid=${Kpiid}`;
      return this.http.post<any>(url, {}).pipe(
        tap(res => { if (res.isSuccess) this.notifykpisChanged(); })
      );;
    }
  
    deletekpis(KpiId: string): Observable<ApiResponse<any>> {
      const url = `${API_ENDPOINTS.KPI.DELETE}?KpiId=${KpiId}`;
      return this.http.post<any>(url, {}).pipe(
        tap(res => { if (res.isSuccess) this.notifykpisChanged(); })
      );
    }
}
