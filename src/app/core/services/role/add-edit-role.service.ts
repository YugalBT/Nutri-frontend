import { Injectable } from '@angular/core';
import { HttpService } from '../../../shared/services/http.service';
import { ApiResponse } from '../../models/api-response';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../../constants/api-endpoints';
import { RoleItem, GetAllRolesResponse, CreateUpdateRolePayload, RoleByIdResponse } from '../../models/add-edit-role';

@Injectable({
  providedIn: 'root'
})
export class AddEditRoleService {

  constructor(private http: HttpService) { }

  getRoles(payload?: any): Observable<ApiResponse<GetAllRolesResponse>> {
    return this.http.post<GetAllRolesResponse>(`${API_ENDPOINTS.ROLE?.GET_ALL}`, payload || {});
  }

  createRole(data: CreateUpdateRolePayload): Observable<ApiResponse<RoleItem>> {
    return this.http.post<RoleItem>(`${API_ENDPOINTS.ROLE?.CREATE}`, data);
  }

  updateRole(data: CreateUpdateRolePayload): Observable<ApiResponse<RoleItem>> {
    return this.http.post<RoleItem>(`${API_ENDPOINTS.ROLE?.UPDATE}`, data);
  }

  deleteRole(roleId: string): Observable<ApiResponse<any>> {
    const url = `${API_ENDPOINTS.ROLE?.DELETE}?RoleId=${encodeURIComponent(roleId)}`;
    return this.http.post<any>(url, {});
  }
}
