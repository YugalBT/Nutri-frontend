import { Injectable } from '@angular/core';
import { HttpService } from '../../../shared/services/http.service';
import { Observable, Subject, tap } from 'rxjs';
import { ApiResponse } from '../../models/api-response';
import { API_ENDPOINTS } from '../../constants/api-endpoints';
import { FormulaList } from '../../models/formula-list';

@Injectable({
  providedIn: 'root'
})
export class FormulaService {

   constructor(private http: HttpService) {}
  
    
      private formulasChangedSubject = new Subject<void>();
      formulasChanged$ = this.formulasChangedSubject.asObservable();
    
      notifyformulasChanged() {
        this.formulasChangedSubject.next();
      }
    
      getformulasDetails(payload: any): Observable<ApiResponse<FormulaList[]>> {
        return this.http.post<FormulaList[]>(API_ENDPOINTS.FORMULA.GET_ALL, payload);
      }
    
      createformula(payload: any): Observable<ApiResponse<any>> {
        return this.http.post<any>(API_ENDPOINTS.FORMULA.CREATE, payload).pipe(
              tap(res => { if (res.isSuccess) this.notifyformulasChanged(); })
            );
      }
    
      updateformula(payload: any): Observable<ApiResponse<any>> {
        return this.http.post<any>(API_ENDPOINTS.FORMULA.UPDATE, payload).pipe(
              tap(res => { if (res.isSuccess) this.notifyformulasChanged(); })
            );
      }
    
      
      activeInActive(formulaId: string): Observable<ApiResponse<any>> {
        const url = `${API_ENDPOINTS.FORMULA.ACTIVE_INACTIVE}?FormulaId=${formulaId}`;
        return this.http.post<any>(url, {}).pipe(
              tap(res => { if (res.isSuccess) this.notifyformulasChanged(); })
            );
      }
  
      deleteformula(formulaId: string): Observable<ApiResponse<any>> {
        const url = `${API_ENDPOINTS.FORMULA.DELETE}?FormulaId=${formulaId}`;
        return this.http.post<any>(url, {}).pipe(
              tap(res => { if (res.isSuccess) this.notifyformulasChanged(); })
            );
      }

       validateformula(payload: any): Observable<ApiResponse<any>> {
        return this.http.post<any>(API_ENDPOINTS.FORMULA.VALIDATE_FORMULA, payload).pipe(
              tap(res => { if (res.isSuccess) this.notifyformulasChanged(); })
            );
      }
}
