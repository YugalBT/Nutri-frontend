import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Company } from '../../models/company-add-edit';
import { ApiResponse } from '../../models/api-response';
import { HttpService } from '../../../shared/services/http.service';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {

  private baseUrl = '/Tenant';

  // refresh subject
  private companiesChangedSource = new Subject<void>();
  companiesChanged$ = this.companiesChangedSource.asObservable();

  constructor(private http: HttpService) { }

  // Correct notify
  notifyCompaniesChanged() {
    this.companiesChangedSource.next();
  }

  createCompany(model: FormData): Observable<ApiResponse<any>> {
    return this.http.post(`${this.baseUrl}/Create`, model);
  }

  updateCompany(model: FormData): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.baseUrl}/Update`,
      model
    );
  }

  deleteCompany(tenantId: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.baseUrl}/Delete?TenantId=${tenantId}`,
      null
    );
  }

  ativeInactiveCompanyStatus(tenantId: string, isActive: boolean): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.baseUrl}/ActiveInActive?TenantId=${tenantId}&IsActive=${isActive}`,
      null
    );
  }

  getAllCompaniesPaginated(payload: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.baseUrl}/GetAll`,
      payload
    );
  }
   getAllMappedCompanies(payload: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.baseUrl}/GetMappedCompanies`,
      payload
    );
  }
}
