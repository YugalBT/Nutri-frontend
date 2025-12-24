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
import { AnimallactationList } from '../../core/models/animallactation-list';
import { AnimalGroupList } from '../../core/models/animal-group-list';
import { TemplateCategoryList } from '../../core/models/template-builder/template-category-list';
import { TemplatePlaceholderList } from '../../core/models/template-builder/template-placeholder-list';

@Injectable({
  providedIn: 'root'
})
export class CommonService {
  constructor(private http: HttpService,
    private toast: ToastService,
    private translate: TranslateService
  ) { }

  checkPermission(roleName: string) {
    if (!StorageHelper.CheckRole(roleName)) {
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
  getAnimalTypeList(): Observable<ApiResponse<any>> {
    return this.http.get<FarmList>(API_ENDPOINTS.COMMON_API.GET_ALL_ANIMALTYPE);
  }
  getAnimalLactationStageList(): Observable<ApiResponse<AnimallactationList>> {
    return this.http.get<AnimallactationList>(API_ENDPOINTS.COMMON_API.GET_ALL_ANIMAL_LACTATION);
  }

  getAnimalGroupsList(): Observable<ApiResponse<AnimalGroupList>> {
    return this.http.get<AnimalGroupList>(API_ENDPOINTS.COMMON_API.GET_ALL_ANIMAL_GROUP);
  }

  getAlltemplateCategoryList(): Observable<ApiResponse<TemplateCategoryList[]>> {
    return this.http.get<TemplateCategoryList[]>(API_ENDPOINTS.COMMON_API.GET_TEMPLATE_CATEGORY);
  }

  getAlltemplatePlaceholderList(): Observable<ApiResponse<TemplatePlaceholderList[]>> {
    return this.http.get<TemplatePlaceholderList[]>(API_ENDPOINTS.COMMON_API.GET_TEMPLATE_PLACEHOLDER);
  }

}
