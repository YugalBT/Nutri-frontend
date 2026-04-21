import { Injectable } from '@angular/core';
import { HttpService } from '../../../shared/services/http.service';
import { Observable, Subject } from 'rxjs';
import { ProductSellingPriceVm } from '../../models/product-price-vm';
import { ApiResponse } from '../../models/api-response';
import { API_ENDPOINTS } from '../../constants/api-endpoints';

@Injectable({
  providedIn: 'root'
})
export class ProductSellingPriceService {

  constructor(private http: HttpService) { }

  private priceChanged = new Subject<void>();

  priceChanged$ = this.priceChanged.asObservable();

  notifyPriceChanged() {
    this.priceChanged.next();
  }

  savePrice(payload: ProductSellingPriceVm): Observable<ApiResponse<any>> {
    return this.http.post<any>(API_ENDPOINTS.PRODUCTPRICING.CREATE, payload);
  }

  getAllPrice(payload: any): Observable<ApiResponse<ProductSellingPriceVm[]>> {
    return this.http.post<ProductSellingPriceVm[]>(API_ENDPOINTS.PRODUCTPRICING.GET_ALL, payload);

  }

  deletePrice(productPriceId: string): Observable<ApiResponse<any>> {
    const url = `${API_ENDPOINTS.PRODUCTPRICING.DELETE}?ProductPriceId=${productPriceId}`;
    return this.http.post<any>(url, {});
  }

  activeInActive(productPriceId: string): Observable<ApiResponse<any>> {
    const url = `${API_ENDPOINTS.PRODUCTPRICING.ACTIVE_INACTIVE}?ProductPriceId=${productPriceId}`;
    return this.http.post<any>(url, {});
  }
  getPreviousPrice(productId: string, priceMonth: string) {

    return this.http.get<any>(
      API_ENDPOINTS.PRODUCTPRICING.GET_PREVIOUS_PRICE +
      `?productId=${productId}&priceMonth=${priceMonth}`
    );

  }

  getSuggestedPrice(productId: string): Observable<ApiResponse<any>> {

    return this.http.get<any>(
      API_ENDPOINTS.PRODUCTPRICING.GET_SUGGESTED_PRICE +
      `?productId=${productId}`
    );

  }

}
