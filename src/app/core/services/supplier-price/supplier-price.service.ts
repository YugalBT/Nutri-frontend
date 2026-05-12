import { Injectable } from '@angular/core';
import { HttpService } from '../../../shared/services/http.service';
import { Observable, Subject } from 'rxjs';
import { ApiResponse } from '../../models/api-response';
import { SupplierList } from '../../models/supplier-list';
import { API_ENDPOINTS } from '../../constants/api-endpoints';

@Injectable({
  providedIn: 'root'
})
export class SupplierPriceService {

  constructor(private http: HttpService) {}
  
    private supplierPriceChangedSubject = new Subject<void>();
    supplierPriceChanged$ = this.supplierPriceChangedSubject.asObservable();
  
    notifySupplierPriceChanged() {
      this.supplierPriceChangedSubject.next();
    }
  
    getSupplierPrices(payload: any): Observable<ApiResponse<SupplierList[]>> {
      return this.http.post<SupplierList[]>(API_ENDPOINTS.SUPPLIERPRICE.GET_ALL, payload);
    }
  
    saveSupplierPrice(payload: any): Observable<ApiResponse<any>> {
      return this.http.post<any>(API_ENDPOINTS.SUPPLIERPRICE.CREATE_OR_UPDATE, payload);
    }
  
    updateSupplierPrice(payload: any): Observable<ApiResponse<any>> {
      return this.http.post<any>(API_ENDPOINTS.SUPPLIERPRICE.UPDATE, payload);
    }
  
    activeInActive(id: string): Observable<ApiResponse<any>> {
      const url = `${API_ENDPOINTS.SUPPLIERPRICE.ACTIVE_INACTIVE}?SupplierPriceId=${id}`;
      return this.http.post<any>(url, {});
    }
  
    deleteSupplierPrice(id: string): Observable<ApiResponse<any>> {
      const url = `${API_ENDPOINTS.SUPPLIERPRICE.DELETE}?SupplierPriceId=${id}`;
      return this.http.post<any>(url, {});
    }

    bulkSaveSupplierPrices(payload: any): Observable<ApiResponse<any>> {
    return this.http.post(API_ENDPOINTS.SUPPLIERPRICE.CREATE_OR_UPDATE,payload);
    }

      // =================  IMPORT / EXPORT =================

  importSupplierPrices(file: File, supplierId: string | null): Observable<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('file', file);
    if (supplierId) {
      formData.append('supplierId', supplierId);
    }

    return this.http.post<ApiResponse<any>>(
      API_ENDPOINTS.SUPPLIERPRICE.IMPORT,
      formData
    );
  }

  exportSupplierPrices(supplierId: string | null): Observable<ApiResponse<any>> {
    const base = API_ENDPOINTS.SUPPLIERPRICE.EXPORT;
    const url = supplierId ? `${base}?supplierId=${supplierId}` : base;
    return this.http.get<ApiResponse<any>>(url);
  }

  downloadSampleCSV(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(API_ENDPOINTS.SUPPLIERPRICE.EXPORT_SAMPLE);
  }


}
