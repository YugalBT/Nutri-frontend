import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, tap } from 'rxjs';
import { HttpService } from '../../../shared/services/http.service';
import { ApiResponse } from '../../models/api-response';
import { API_ENDPOINTS } from '../../constants/api-endpoints';
import { FormulaType, PricingAttribute, PricingAttributeCatalog } from '../../models/pricing-attribute';

@Injectable({ providedIn: 'root' })
export class PricingAttributeService {

  /** BehaviorSubject so any component gets the latest catalog immediately on subscribe. */
  private catalogSubject = new BehaviorSubject<PricingAttributeCatalog>({
    categories:   [],
    formats:      [],
    dosages:      [],
    types:        [],
    formulaTypes: [],
  });

  catalog$ = this.catalogSubject.asObservable();

  private changedSubject = new Subject<void>();
  attributesChanged$ = this.changedSubject.asObservable();

  constructor(private http: HttpService) {}

  notifyChanged(): void {
    this.changedSubject.next();
  }

  /** Load all attributes once and push to catalog$. */
  loadCatalog(): Observable<ApiResponse<PricingAttributeCatalog>> {
    return this.http
      .get<PricingAttributeCatalog>(API_ENDPOINTS.PRICING_ATTRIBUTES.GET_CATALOG)
      .pipe(
        tap((res) => {
          if (res.isSuccess && res.data) {
            this.catalogSubject.next(res.data);
          }
        }),
      );
  }

  /** Snapshot of current catalog (synchronous, no subscription needed). */
  get snapshot(): PricingAttributeCatalog {
    return this.catalogSubject.getValue();
  }

  createAttribute(payload: {
    attributeType: string;
    name: string;
    sortOrder: number;
  }): Observable<ApiResponse<string>> {
    return this.http.post<string>(API_ENDPOINTS.PRICING_ATTRIBUTES.CREATE, payload);
  }

  updateAttribute(payload: {
    pricingAttributeId: string;
    name: string;
    sortOrder: number;
  }): Observable<ApiResponse<string>> {
    return this.http.post<string>(API_ENDPOINTS.PRICING_ATTRIBUTES.UPDATE, payload);
  }

  deleteAttribute(id: string): Observable<ApiResponse<string>> {
    return this.http.post<string>(
      `${API_ENDPOINTS.PRICING_ATTRIBUTES.DELETE}?id=${id}`,
      {},
    );
  }

  activeInActive(id: string): Observable<ApiResponse<string>> {
    return this.http.post<string>(
      `${API_ENDPOINTS.PRICING_ATTRIBUTES.ACTIVE_INACTIVE}?id=${id}`,
      {},
    );
  }

  // ── Formula Type CRUD ────────────────────────────────────────────────────

  createFormulaType(payload: {
    name: string;
    description: string | null;
    costDivisor: number;
    sortOrder: number;
  }): Observable<ApiResponse<string>> {
    return this.http.post<string>(API_ENDPOINTS.PRICING_FORMULA_TYPES.CREATE, payload);
  }

  updateFormulaType(payload: {
    formulaTypeId: string;
    name: string;
    description: string | null;
    costDivisor: number;
    sortOrder: number;
  }): Observable<ApiResponse<string>> {
    return this.http.post<string>(API_ENDPOINTS.PRICING_FORMULA_TYPES.UPDATE, payload);
  }

  deleteFormulaType(id: string): Observable<ApiResponse<string>> {
    return this.http.post<string>(
      `${API_ENDPOINTS.PRICING_FORMULA_TYPES.DELETE}?id=${id}`,
      {},
    );
  }

  activeInActiveFormulaType(id: string): Observable<ApiResponse<string>> {
    return this.http.post<string>(
      `${API_ENDPOINTS.PRICING_FORMULA_TYPES.ACTIVE_INACTIVE}?id=${id}`,
      {},
    );
  }
}
