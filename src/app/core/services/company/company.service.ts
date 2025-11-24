import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Company } from '../../models/company-add-edit';
import { ApiResponse } from '../../models/api-response';
import { HttpService } from '../../../shared/services/http.service';

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

}
