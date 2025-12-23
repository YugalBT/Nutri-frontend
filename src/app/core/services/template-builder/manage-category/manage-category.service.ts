import { Injectable } from '@angular/core';
import { HttpService } from '../../../../shared/services/http.service';
import { Observable, Subject, tap } from 'rxjs';
import { ApiResponse } from '../../../models/api-response';
import { TemplateCategoryList } from '../../../models/template-builder/template-category-list';
import { API_ENDPOINTS } from '../../../constants/api-endpoints';

@Injectable({
  providedIn: 'root'
})
export class ManageCategoryService {

  constructor(private http: HttpService) { }
    
    
      private templateCategoryChangedSubject = new Subject<void>();
      templateCategoriesChanged$ = this.templateCategoryChangedSubject.asObservable();
    
      templateCategoriesChanged() {
        this.templateCategoryChangedSubject.next();
      }
    
      gettemplateCategoryDetails(payload: any): Observable<ApiResponse<any>> {
        return this.http.post<TemplateCategoryList[]>(API_ENDPOINTS.TemplateCategory.GET_ALL, payload);
      }
    
      createTemplateCategory(payload: any): Observable<ApiResponse<any>> {
        return this.http.post<any>(API_ENDPOINTS.TemplateCategory.CREATE, payload).pipe(
          tap(res => { if (res.isSuccess) this.templateCategoriesChanged(); })
        );
      }
    
      updateTemplateCategory(payload: any): Observable<ApiResponse<any>> {
        return this.http.post<any>(API_ENDPOINTS.TemplateCategory.UPDATE, payload).pipe(
          tap(res => { if (res.isSuccess) this.templateCategoriesChanged(); })
        );
      }
    
    
      activeInActive(categoryId: string): Observable<ApiResponse<any>> {
        const url = `${API_ENDPOINTS.TemplateCategory.ACTIVE_INACTIVE}?categoryId=${categoryId}`;
        return this.http.post<any>(url, {}).pipe(
          tap(res => { if (res.isSuccess) this.templateCategoriesChanged(); })
        );;
      }
    
      deleteTemplateCategory(categoryId: string): Observable<ApiResponse<any>> {
        const url = `${API_ENDPOINTS.TemplateCategory.DELETE}?categoryId=${categoryId}`;
        return this.http.post<any>(url, {}).pipe(
          tap(res => { if (res.isSuccess) this.templateCategoriesChanged(); })
        );
      }
}
