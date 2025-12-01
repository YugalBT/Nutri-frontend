import { Injectable } from '@angular/core';
import { HttpService } from '../../../shared/services/http.service';
import { Observable, Subject } from 'rxjs';
import { ApiResponse } from '../../models/api-response';
import { API_ENDPOINTS } from '../../constants/api-endpoints';
import { FarmList } from '../../models/farm-list';

@Injectable({
  providedIn: 'root'
})
export class FarmService {

  constructor(private http: HttpService) {}

  
    private farmsChangedSubject = new Subject<void>();
    farmsChanged$ = this.farmsChangedSubject.asObservable();
  
    notifyfarmsChanged() {
      this.farmsChangedSubject.next();
    }
  
    getFarmsDetails(payload: any): Observable<ApiResponse<FarmList[]>> {
      return this.http.post<FarmList[]>(API_ENDPOINTS.FARM.GET_ALL, payload);
    }
  
    createFarms(payload: any): Observable<ApiResponse<any>> {
      return this.http.post<any>(API_ENDPOINTS.FARM.CREATE, payload);
    }
  
    updateFarms(payload: any): Observable<ApiResponse<any>> {
      return this.http.post<any>(API_ENDPOINTS.FARM.UPDATE, payload);
    }
  
    
    activeInActive(userId: string): Observable<ApiResponse<any>> {
      const url = `${API_ENDPOINTS.FARM.ACTIVE_INACTIVE}?FarmId=${userId}`;
      return this.http.post<any>(url, {});
    }

    deleteFarms(userId: string): Observable<ApiResponse<any>> {
      const url = `${API_ENDPOINTS.FARM.DELETE}?FarmId=${userId}`;
      return this.http.post<any>(url, {});
    }
}
