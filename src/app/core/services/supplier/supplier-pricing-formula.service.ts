import { Injectable } from '@angular/core';
import { HttpService } from '../../../shared/services/http.service';
import { Observable, Subject, tap } from 'rxjs';
import { ApiResponse } from '../../models/api-response';
import { API_ENDPOINTS } from '../../constants/api-endpoints';
import { FormulaList } from '../../models/formula-list';
import { SupplierPricingFormulaList } from '../../models/supplier-pricing-formula-list';

@Injectable({
  providedIn: 'root',
})
export class SupplierPricingFormulaService {
  constructor(private http: HttpService) {}

  private SupplierformulasChangedSubject = new Subject<void>();
  formulasChanged$ = this.SupplierformulasChangedSubject.asObservable();

  notifyformulasChanged() {
    this.SupplierformulasChangedSubject.next();
  }

  getformulasDetails(payload: any): Observable<ApiResponse<SupplierPricingFormulaList[]>> {
    return this.http.post<SupplierPricingFormulaList[]>(API_ENDPOINTS.SUPPLIER_PRICE_FORMULA.GET_ALL,payload,);
  }

  createformula(payload: any): Observable<ApiResponse<any>> {
    return this.http.post<any>(API_ENDPOINTS.SUPPLIER_PRICE_FORMULA.CREATE, payload).pipe(
      tap((res) => {
        if (res.isSuccess) this.notifyformulasChanged();
      }),
    );
  }

  updateformula(payload: any): Observable<ApiResponse<any>> {
    return this.http.post<any>(API_ENDPOINTS.SUPPLIER_PRICE_FORMULA.UPDATE, payload).pipe(
      tap((res) => {
        if (res.isSuccess) this.notifyformulasChanged();
      }),
    );
  }

  activeInActive(formulaId: string): Observable<ApiResponse<any>> {
    const url = `${API_ENDPOINTS.SUPPLIER_PRICE_FORMULA.ACTIVE_INACTIVE}?FormulaId=${formulaId}`;
    return this.http.post<any>(url, {}).pipe(
      tap((res) => {
        if (res.isSuccess) this.notifyformulasChanged();
      }),
    );
  }

  deleteformula(formulaId: string): Observable<ApiResponse<any>> {
    const url = `${API_ENDPOINTS.SUPPLIER_PRICE_FORMULA.DELETE}?FormulaId=${formulaId}`;
    return this.http.post<any>(url, {}).pipe(
      tap((res) => {
        if (res.isSuccess) this.notifyformulasChanged();
      }),
    );
  }

  validateformula(payload: any): Observable<ApiResponse<any>> {
    return this.http.post<any>(API_ENDPOINTS.SUPPLIER_PRICE_FORMULA.VALIDATE_FORMULA, payload).pipe(
        tap((res) => {
          if (res.isSuccess) this.notifyformulasChanged();
        }),
      );
  }
}
