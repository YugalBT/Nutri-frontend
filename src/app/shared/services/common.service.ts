import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from './http.service';
import { ApiResponse } from '../../core/models/api-response';
import { RoleList } from '../../core/models/rolelist';
import { Constants } from '../utils/constants/constants';
import { API_ENDPOINTS } from '../../core/constants/api-endpoints';
import { GetAllModulesResponse } from '../../core/models/add-edit-role';
import { FarmList } from '../../core/models/farm-list';
import { FeedList } from '../../core/models/feed-list';
import { DayList } from '../../core/models/day-list';
import { StorageHelper } from '../../core/helpers/storage.helper';
import { ToastService } from './toast.service';
import { TranslateService } from '../../i18n/translate.service';

@Injectable({
  providedIn: 'root'
})
export class CommonService {
  constructor(private http: HttpService,
    private toast : ToastService,
    private translate : TranslateService
  ) { }

  checkPermission(roleName : string){
      console.log("rolename" , roleName)
      if(!StorageHelper.CheckRole(roleName)){
            console.log("role" , "no")
  
         this.toast.error(this.translate.instant('common.noPermission') || 'No permission');
         return false;
      }
      return true;
    }
  getRoles(): Observable<ApiResponse<RoleList[]>> {
    return this.http.get<RoleList[]>(API_ENDPOINTS.COMMON_API.GET_ALL_ROLES);
  }

  getModules(masterRoles: boolean): Observable<ApiResponse<GetAllModulesResponse>> {
    return this.http.get<GetAllModulesResponse>(`${API_ENDPOINTS.Module.GET_ALL}?masterRoles=${masterRoles}`,);
  }

  getFarmsList(): Observable<ApiResponse<FarmList>> {
    return this.http.get<FarmList>(API_ENDPOINTS.COMMON_API.GET_ALL_FARMS);
  }

  getFeedList(): Observable<ApiResponse<FeedList>> {
    return this.http.get<FeedList>(API_ENDPOINTS.COMMON_API.GET_ALL_FEED);
  }
  getDayList(): Observable<ApiResponse<DayList>> {
    return this.http.get<DayList>(API_ENDPOINTS.COMMON_API.GET_ALL_Days);
  }


}
