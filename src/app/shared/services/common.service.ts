import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from './http.service';
import { ApiResponse } from '../../core/models/api-response';
import {RoleList } from '../../core/models/rolelist';
import { Constants } from '../utils/constants/constants';
import { API_ENDPOINTS } from '../../core/constants/api-endpoints';
import { GetAllModulesResponse } from '../../core/models/add-edit-role';

@Injectable({
  providedIn: 'root'
})
export class CommonService {
  constructor(private http: HttpService) {}

  
  getRoles(): Observable<ApiResponse<RoleList[]>> {
    return this.http.get<RoleList[]>(API_ENDPOINTS.COMMON_API.GET_ALL_ROLES);
  }

  getModules(masterRoles: boolean): Observable<ApiResponse<GetAllModulesResponse>> {
    return this.http.get<GetAllModulesResponse>(`${API_ENDPOINTS.Module.GET_ALL}?masterRoles=${masterRoles}`,);
  }
 
  

}
