import { Injectable } from '@angular/core';
import { HttpService } from '../../../shared/services/http.service';
import { Observable, Subject, tap } from 'rxjs';
import { ApiResponse } from '../../models/api-response';
import { API_ENDPOINTS } from '../../constants/api-endpoints';
import { TechnicalReport } from '../../models/technical-report';

@Injectable({
  providedIn: 'root'
})
export class TechnicalReportService {

  constructor(private http: HttpService) { }
  
  
    private technicalReportChangedSubject = new Subject<void>();
    technicalReportsChanged$ = this.technicalReportChangedSubject.asObservable();
  
    notifytechnicalReportsChanged() {
      this.technicalReportChangedSubject.next();
    }
  
    getTechnicalReportDetails(payload: any): Observable<ApiResponse<TechnicalReport[]>> {
      return this.http.post<TechnicalReport[]>(API_ENDPOINTS.TECHNICAL_REPORT.GET_ALL, payload);
    }
  
    createTechnicalReports(payload: any): Observable<ApiResponse<any>> {
      return this.http.post<any>(API_ENDPOINTS.TECHNICAL_REPORT.CREATE, payload).pipe(
        tap(res => { if (res.isSuccess) this.notifytechnicalReportsChanged(); })
      );
    }
  
    updateTechnicalReports(payload: any): Observable<ApiResponse<any>> {
      return this.http.post<any>(API_ENDPOINTS.TECHNICAL_REPORT.UPDATE, payload).pipe(
        tap(res => { if (res.isSuccess) this.notifytechnicalReportsChanged(); })
      );
    }
  
  
    activeInActive(Kpiid: string): Observable<ApiResponse<any>> {
      const url = `${API_ENDPOINTS.TECHNICAL_REPORT.ACTIVE_INACTIVE}?Kpiid=${Kpiid}`;
      return this.http.post<any>(url, {}).pipe(
        tap(res => { if (res.isSuccess) this.notifytechnicalReportsChanged(); })
      );;
    }
  
    deletekpis(KpiId: string): Observable<ApiResponse<any>> {
      const url = `${API_ENDPOINTS.TECHNICAL_REPORT.DELETE}?KpiId=${KpiId}`;
      return this.http.post<any>(url, {}).pipe(
        tap(res => { if (res.isSuccess) this.notifytechnicalReportsChanged(); })
      );
    }
}
