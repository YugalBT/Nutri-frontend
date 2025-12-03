import { Injectable } from '@angular/core';
import { HttpService } from '../../../shared/services/http.service';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../models/api-response';
import { API_ENDPOINTS } from '../../constants/api-endpoints';

@Injectable({
  providedIn: 'root'
})
export class CompanysettingService {

  constructor(
    private http: HttpService,
  ) {

  }

  updateCompanySetting(payload: any): Observable<ApiResponse<any>> {
    return this.http.post<any>(API_ENDPOINTS.COMPANY.UPDATE, payload);
  }

 companyDetails(): Observable<ApiResponse<any>> {
  return this.http.post<any>(API_ENDPOINTS.COMPANY.GET_BY_ID, {});
}

}
