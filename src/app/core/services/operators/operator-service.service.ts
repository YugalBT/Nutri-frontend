import { Injectable } from '@angular/core';
import { HttpService } from '../../../shared/services/http.service';
import { Observable, Subject, tap } from 'rxjs';
import { ApiResponse } from '../../models/api-response';
import { OperatorList } from '../../models/operator-list';
import { API_ENDPOINTS } from '../../constants/api-endpoints';

@Injectable({
  providedIn: 'root'
})
export class OperatorServiceService {

  constructor(private http: HttpService) { }


  private operatorChangedSubject = new Subject<void>();
  operatorsChanged$ = this.operatorChangedSubject.asObservable();

  operatorsChanged() {
    this.operatorChangedSubject.next();
  }

  getOperatorDetails(payload: any): Observable<ApiResponse<any>> {
    return this.http.post<OperatorList[]>(API_ENDPOINTS.OPERATOR.GET_ALL, payload);
  }

  createOperator(payload: any): Observable<ApiResponse<any>> {
    return this.http.post<any>(API_ENDPOINTS.OPERATOR.CREATE, payload).pipe(
      tap(res => { if (res.isSuccess) this.operatorsChanged(); })
    );
  }

  updateOperator(payload: any): Observable<ApiResponse<any>> {
    return this.http.post<any>(API_ENDPOINTS.OPERATOR.UPDATE, payload).pipe(
      tap(res => { if (res.isSuccess) this.operatorsChanged(); })
    );
  }


  activeInActive(operatorId: string): Observable<ApiResponse<any>> {
    const url = `${API_ENDPOINTS.OPERATOR.ACTIVE_INACTIVE}?operatorId=${operatorId}`;
    return this.http.post<any>(url, {}).pipe(
      tap(res => { if (res.isSuccess) this.operatorsChanged(); })
    );;
  }

  deleteTemplateCategory(operatorId: string): Observable<ApiResponse<any>> {
    const url = `${API_ENDPOINTS.OPERATOR.DELETE}?operatorId=${operatorId}`;
    return this.http.post<any>(url, {}).pipe(
      tap(res => { if (res.isSuccess) this.operatorsChanged(); })
    );
  }
}
