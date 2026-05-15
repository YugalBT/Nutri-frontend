import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { HttpService } from '../../../shared/services/http.service';
import { ApiResponse } from '../../models/api-response';
import { API_ENDPOINTS } from '../../constants/api-endpoints';
import {
  PricingRule,
  CalculatedPriceVm,
  CalculatePriceRequest,
} from '../../models/pricing-rule';

@Injectable({ providedIn: 'root' })
export class PricingRulesService {
  private changedSubject = new Subject<void>();
  pricingRulesChanged$ = this.changedSubject.asObservable();

  constructor(private http: HttpService) {}

  notifyPricingRulesChanged() {
    this.changedSubject.next();
  }

  getAllPricingRules(payload: any): Observable<ApiResponse<PricingRule[]>> {
    return this.http.post<PricingRule[]>(
      API_ENDPOINTS.PRICING_RULES.GET_ALL,
      payload,
    );
  }

  createPricingRule(payload: any): Observable<ApiResponse<string>> {
    return this.http.post<string>(API_ENDPOINTS.PRICING_RULES.CREATE, payload);
  }

  updatePricingRule(payload: any): Observable<ApiResponse<string>> {
    return this.http.post<string>(API_ENDPOINTS.PRICING_RULES.UPDATE, payload);
  }

  deletePricingRule(id: string): Observable<ApiResponse<string>> {
    return this.http.post<string>(
      `${API_ENDPOINTS.PRICING_RULES.DELETE}?id=${id}`,
      {},
    );
  }

  activeInActive(id: string): Observable<ApiResponse<string>> {
    return this.http.post<string>(
      `${API_ENDPOINTS.PRICING_RULES.ACTIVE_INACTIVE}?id=${id}`,
      {},
    );
  }

  calculatePrice(
    payload: CalculatePriceRequest,
  ): Observable<ApiResponse<CalculatedPriceVm>> {
    return this.http.post<CalculatedPriceVm>(
      API_ENDPOINTS.PRICING_RULES.CALCULATE,
      payload,
    );
  }
}
