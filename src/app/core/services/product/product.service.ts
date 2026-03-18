import { Injectable } from '@angular/core';
import { API_ENDPOINTS } from '../../constants/api-endpoints';
import { HttpService } from '../../../shared/services/http.service';
import { Observable, Subject } from 'rxjs';
import { MaterialList } from '../../models/material-list';
import { ApiResponse } from '../../models/api-response';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

   constructor(private http: HttpService) {}
  
    private productsChangedSubject = new Subject<void>();
    productsChanged$ = this.productsChangedSubject.asObservable();
  
    notifyProductChanged() {
      this.productsChangedSubject.next();
    }
  
    getAll(payload: any): Observable<ApiResponse<MaterialList[]>> {
      return this.http.post<MaterialList[]>(API_ENDPOINTS.PRODUCT.GET_ALL, payload);
    }
  
    createProduct(payload: any): Observable<ApiResponse<any>> {
      return this.http.post<any>(API_ENDPOINTS.PRODUCT.CREATE, payload);
    }
  
    updateProduct(payload: any): Observable<ApiResponse<any>> {
      return this.http.post<any>(API_ENDPOINTS.PRODUCT.UPDATE, payload);
    }
  
    activeInActive(ProductId: string): Observable<ApiResponse<any>> {
      const url = `${API_ENDPOINTS.PRODUCT.ACTIVE_INACTIVE}?ProductId=${ProductId}`;
      return this.http.post<any>(url, {});
    }
  
    deleteProduct(ProductId: string): Observable<ApiResponse<any>> {
      const url = `${API_ENDPOINTS.PRODUCT.DELETE}?ProductId=${ProductId}`;
      return this.http.post<any>(url, {});
    }
  
     generateProductCode(ProductName: string): Observable<ApiResponse<string>> {
      return this.http.get<string>(`${API_ENDPOINTS.MATERIAL.GENERATE_SUPPLIER_CODE}?materialName=${ProductName}`);
    }
}


