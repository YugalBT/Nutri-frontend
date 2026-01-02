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
import { StorageHelper } from '../../core/helpers/storage.helper';
import { ToastService } from './toast.service';
import { TranslateService } from '../../i18n/translate.service';
import { AnimallactationList } from '../../core/models/animallactation-list';
import { AnimalGroupList } from '../../core/models/animal-group-list';
import { TemplateCategoryList } from '../../core/models/template-builder/template-category-list';
import { TemplatePlaceholderList } from '../../core/models/template-builder/template-placeholder-list';
import { RationList } from '../../core/models/ration-list';
import { OperatorList, OperatorsAndRationsList } from '../../core/models/operator-list';
import { FormulaList } from '../../core/models/formula-list';
import { KpiList } from '../../core/models/day-list';

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
  getDayList(): Observable<ApiResponse<KpiList>> {
    return this.http.get<KpiList>(API_ENDPOINTS.COMMON_API.GET_ALL_Days);
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

   getGetAllRationList(): Observable<ApiResponse<RationList[]>> {
    return this.http.get<RationList[]>(API_ENDPOINTS.COMMON_API.GET_RATION);
  }

   getGetAllOperatorList(): Observable<ApiResponse<OperatorList[]>> {
    return this.http.get<OperatorList[]>(API_ENDPOINTS.COMMON_API.GET_OPERATOR);
  }

  getGetAllOperatorsAndRationsList(): Observable<ApiResponse<OperatorsAndRationsList[]>> {
    return this.http.get<OperatorsAndRationsList[]>(API_ENDPOINTS.COMMON_API.GET_OPERATORS_AND_RATIONS);
  }

  getAnimalGroupByFarmID(FarmId: string): Observable<ApiResponse<AnimalGroupList[]>> {
    return this.http.get<AnimalGroupList[]>(`${API_ENDPOINTS.COMMON_API.GET_ANIMALGROUPS_BY_FARM_ID}?FarmId=${FarmId}`,);
  }
  getFeedByFarmID(FarmId: string): Observable<ApiResponse<FeedList[]>> {
    return this.http.get<FeedList[]>(`${API_ENDPOINTS.COMMON_API.GET_FEEDS_BY_FARM_ID}?FarmId=${FarmId}`,);
  }

  GetAllPlaceholderByCategoryId(categoryId: string): Observable<ApiResponse<TemplatePlaceholderList[]>> {
    return this.http.get<TemplatePlaceholderList[]>(`${API_ENDPOINTS.COMMON_API.GET_PLACEHOLDER_BY_CATEGORY_ID}?CategoryId=${categoryId}`,);
  }

   getFormulaList(): Observable<ApiResponse<FormulaList>> {
    return this.http.get<FormulaList>(API_ENDPOINTS.COMMON_API.GET_ALL_FORMULA_LIST);
  }
}
