import { Injectable } from '@angular/core';
import { HttpService } from '../../../shared/services/http.service';
import { ModuleList } from '../../models/module-list';
import { ApiResponse } from '../../models/api-response';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../../constants/api-endpoints';

@Injectable({
  providedIn: 'root'
})
export class ModuleListService {

  constructor(private http: HttpService) {}

  getModules(masterRoles: boolean): Observable<ApiResponse<ModuleList[]>> {
    const url = `${API_ENDPOINTS.Module.GET_ALL}?masterRoles=${masterRoles}`;
    return this.http.get<ModuleList[]>(url);
  }


  addModule(payload: any): Observable<ApiResponse<any>> {
    return this.http.post<any>(API_ENDPOINTS.Module.CREATE, payload);
  }

  deleteModule(moduleId: string): Observable<ApiResponse<any>> {
    return this.http.post<any>(`${API_ENDPOINTS.Module.DELETE}?ModuleId=${moduleId}`,{});
  }
  // update module

    updateModule(payload: any): Observable<ApiResponse<any>> {
    return this.http.post<any>(API_ENDPOINTS.Module.UPDATE, payload);
  }
  
}
