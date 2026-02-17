import { Injectable } from '@angular/core';
import { HttpService } from '../../../shared/services/http.service';
import { Observable, Subject } from 'rxjs';
import { ApiResponse } from '../../models/api-response';
import { API_ENDPOINTS } from '../../constants/api-endpoints';
import { SupplierList } from '../../models/supplier-list';

@Injectable({
  providedIn: 'root'
})
export class SupplierService {

  constructor(private http: HttpService) {}

  private suppliersChangedSubject = new Subject<void>();
  suppliersChanged$ = this.suppliersChangedSubject.asObservable();

  notifySuppliersChanged() {
    this.suppliersChangedSubject.next();
  }

  getSuppliers(payload: any): Observable<ApiResponse<SupplierList[]>> {
    return this.http.post<SupplierList[]>(API_ENDPOINTS.SUPPLIER.GET_ALL, payload);
  }

  createSupplier(payload: any): Observable<ApiResponse<any>> {
    return this.http.post<any>(API_ENDPOINTS.SUPPLIER.CREATE, payload);
  }

  updateSupplier(payload: any): Observable<ApiResponse<any>> {
    return this.http.post<any>(API_ENDPOINTS.SUPPLIER.UPDATE, payload);
  }

  activeInActive(id: string): Observable<ApiResponse<any>> {
    const url = `${API_ENDPOINTS.SUPPLIER.ACTIVE_INACTIVE}?SupplierId=${id}`;
    return this.http.post<any>(url, {});
  }

  deleteSupplier(id: string): Observable<ApiResponse<any>> {
    const url = `${API_ENDPOINTS.SUPPLIER.DELETE}?SupplierId=${id}`;
    return this.http.post<any>(url, {});
  }

   generateSupplierCode(firstName: string): Observable<ApiResponse<string>> {
    return this.http.get<string>(`${API_ENDPOINTS.SUPPLIER.GENERATE_SUPPLIER_CODE}?FirstName=${firstName}`);
  }
  
}