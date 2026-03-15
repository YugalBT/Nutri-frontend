import { Injectable } from '@angular/core';
import { HttpService } from '../../../shared/services/http.service';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../models/api-response';
import { API_ENDPOINTS } from '../../constants/api-endpoints';

@Injectable({
  providedIn: 'root'
})
export class SupplierPricingSettingService {

  constructor(
     private http: HttpService
   ) {
   }
 
   update(payload: FormData): Observable<ApiResponse<any>> {
     return this.http.post<any>(API_ENDPOINTS.PRICINGSETTING.UPDATE, payload);
   }
 
   getAll(): Observable<ApiResponse<any>> {
   return this.http.post<any>(API_ENDPOINTS.PRICINGSETTING.GET_ALL, {});
 }
}
