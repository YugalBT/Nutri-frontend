import { Observable, Subject } from "rxjs";
import { HttpService } from "../../../shared/services/http.service";
import { Injectable } from "@angular/core";
import { ApiResponse } from "../../models/api-response";
import { API_ENDPOINTS } from "../../constants/api-endpoints";

@Injectable({
  providedIn: 'root'
})
export class ProductBuildService {

  constructor(private http: HttpService) { }

  private buildChanged = new Subject<void>();
  buildChanged$ = this.buildChanged.asObservable();

  notifyBuildChanged() {
    this.buildChanged.next();
  }

  create(payload: any): Observable<ApiResponse<any>> {
    return this.http.post(API_ENDPOINTS.PRODUCT_BUILD.CREATE, payload);
  }

  update(payload: any): Observable<ApiResponse<any>> {
    return this.http.post(API_ENDPOINTS.PRODUCT_BUILD.UPDATE, payload);
  }

  getAll(payload: any): Observable<ApiResponse<any[]>> {
    return this.http.post(API_ENDPOINTS.PRODUCT_BUILD.GET_ALL, payload);
  }

  delete(id: string): Observable<ApiResponse<any>> {
    return this.http.post(
      `${API_ENDPOINTS.PRODUCT_BUILD.DELETE}?productBuildId=${id}`,
      {}
    );
  }

  activeInactive(id: string): Observable<ApiResponse<any>> {
    return this.http.post(
      `${API_ENDPOINTS.PRODUCT_BUILD.ACTIVE_INACTIVE}?productBuildId=${id}`,
      {}
    );
  }

  getById(id: string): Observable<ApiResponse<any>> {
    return this.http.get(
      `${API_ENDPOINTS.PRODUCT_BUILD.GET_BY_ID}?id=${id}`
    );
  }

  calculateFormula(payload: { formulaId: string, baseCost: number }): Observable<ApiResponse<any>> {
  return this.http.post(API_ENDPOINTS.SUPPLIER_PRICE_FORMULA.CALCULATE, payload);
}
}