import { Injectable } from '@angular/core';
import { API_ENDPOINTS } from '../../constants/api-endpoints';
import { HttpService } from '../../../shared/services/http.service';
import { Observable, Subject } from 'rxjs';
import { MaterialList } from '../../models/material-list';
import { ApiResponse } from '../../models/api-response';

@Injectable({
  providedIn: 'root'
})
export class MaterialService {

  constructor(private http: HttpService) { }

  private materialsChangedSubject = new Subject<void>();
  materialsChanged$ = this.materialsChangedSubject.asObservable();

  notifyMaterialsChanged() {
    this.materialsChangedSubject.next();
  }

  getMaterials(payload: any): Observable<ApiResponse<MaterialList[]>> {
    return this.http.post<MaterialList[]>(API_ENDPOINTS.MATERIAL.GET_ALL, payload);
  }

  createMaterial(payload: any): Observable<ApiResponse<any>> {
    return this.http.post<any>(API_ENDPOINTS.MATERIAL.CREATE, payload);
  }

  updateMaterial(payload: any): Observable<ApiResponse<any>> {
    return this.http.post<any>(API_ENDPOINTS.MATERIAL.UPDATE, payload);
  }

  activeInActive(id: string): Observable<ApiResponse<any>> {
    const url = `${API_ENDPOINTS.MATERIAL.ACTIVE_INACTIVE}?MaterialId=${id}`;
    return this.http.post<any>(url, {});
  }

  deleteMaterial(id: string): Observable<ApiResponse<any>> {
    const url = `${API_ENDPOINTS.MATERIAL.DELETE}?MaterialId=${id}`;
    return this.http.post<any>(url, {});
  }

  generateMaterialCode(firstName: string): Observable<ApiResponse<string>> {
    return this.http.get<string>(`${API_ENDPOINTS.MATERIAL.GENERATE_SUPPLIER_CODE}?MaterialName=${firstName}`);
  }

  importMaterials(file: File): Observable<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<any>(API_ENDPOINTS.MATERIAL.IMPORTMATERIAL,formData);
  }

  exportMaterials(): Observable<any> {
  return this.http.get(API_ENDPOINTS.MATERIAL.EXPORTMATERIAL);

  }

  exportSampleCSV(): Observable<any> {
    return this.http.get(API_ENDPOINTS.MATERIAL.EXPORTSAMPLECSV);
  }
}

