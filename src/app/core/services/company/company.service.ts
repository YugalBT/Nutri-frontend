import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Company } from '../../models/company-add-edit';
import { ApiResponse } from '../../models/api-response';
import { HttpService } from '../../../shared/services/http.service';
import { HttpParams, HttpHeaders} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {

  private baseUrl = '/Tenant'; 

  constructor(private http: HttpService) {}

  createCompany(model: Company): Observable<ApiResponse<any>> {
    return this.http.post(`${this.baseUrl}/Create`, model);
  }

  updateCompany(model: Company): Observable<ApiResponse<any>> {
     return this.http.post<ApiResponse<any>>(
       `${this.baseUrl}/Update`,
        model
     );
    }

 deleteCompany(tenantId: string): Observable<ApiResponse<any>> {
    // Send tenantId as query string
    return this.http.post<ApiResponse<any>>(
      `${this.baseUrl}/Delete?TenantId=${encodeURIComponent(tenantId)}`,
      null
    );
  }

  /** Toggle active/inactive status */
  ativeInactiveCompanyStatus(tenantId: string, isActive: boolean): Observable<ApiResponse<any>> {
    // Send tenantId and new status as query string
    return this.http.post<ApiResponse<any>>(
      `${this.baseUrl}/ActiveInActive?TenantId=${encodeURIComponent(tenantId)}&IsActive=${isActive}`,
      null
    );
  }

getAllCompaniesPaginated(payload: any): Observable<ApiResponse<any>> {
  return this.http.post<ApiResponse<any>>(
    `${this.baseUrl}/GetAll`,
    payload
  );
}



}


