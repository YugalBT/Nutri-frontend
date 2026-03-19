import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpService } from './http.service';
import { ApiResponse } from '../../core/models/api-response';
import { RoleList } from '../../core/models/rolelist';
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
import {
  OperatorList,
  OperatorsAndRationsList,
} from '../../core/models/operator-list';
import { FormulaList } from '../../core/models/formula-list';
import { KpiList } from '../../core/models/day-list';
import {
  AggregatedAnalyticsData,
  AggregatedArchiveItem,
  AggregatedReportItem,
  CompanyDashboardData,
  DashboardData,
} from '../../core/models/dashboarddata';
import { MaterialList } from '../../core/models/material-list';
import { SupplierList } from '../../core/models/supplier-list';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class CommonService {
  private readonly baseUrl = environment.apiUrl;

  constructor(
    private http: HttpService,
    private httpClient: HttpClient,
    private toast: ToastService,
    private translate: TranslateService,
  ) {}

  checkPermission(roleName: string, showAlert: boolean = true) {
    const hasPermission = StorageHelper.CheckRole(roleName);
    if (!hasPermission && showAlert) {
      this.toast.error(
        this.translate.instant('common.noPermission') || 'No permission',
      );
    }

    return hasPermission;
  }
  getRoles(): Observable<ApiResponse<RoleList[]>> {
    return this.http.get<RoleList[]>(API_ENDPOINTS.COMMON_API.GET_ALL_ROLES);
  }

  getModules(
    masterRoles: boolean,
  ): Observable<ApiResponse<GetAllModulesResponse>> {
    return this.http.get<GetAllModulesResponse>(
      `${API_ENDPOINTS.Module.GET_ALL}?masterRoles=${masterRoles}`,
    );
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
    return this.http.get<AnimallactationList>(
      API_ENDPOINTS.COMMON_API.GET_ALL_ANIMAL_LACTATION,
    );
  }

  getAnimalGroupsList(): Observable<ApiResponse<AnimalGroupList>> {
    return this.http.get<AnimalGroupList>(
      API_ENDPOINTS.COMMON_API.GET_ALL_ANIMAL_GROUP,
    );
  }

  getAlltemplateCategoryList(): Observable<
    ApiResponse<TemplateCategoryList[]>
  > {
    return this.http.get<TemplateCategoryList[]>(
      API_ENDPOINTS.COMMON_API.GET_TEMPLATE_CATEGORY,
    );
  }

  getAlltemplatePlaceholderList(): Observable<
    ApiResponse<TemplatePlaceholderList[]>
  > {
    return this.http.get<TemplatePlaceholderList[]>(
      API_ENDPOINTS.COMMON_API.GET_TEMPLATE_PLACEHOLDER,
    );
  }

  getGetAllRationList(): Observable<ApiResponse<RationList[]>> {
    return this.http.get<RationList[]>(API_ENDPOINTS.COMMON_API.GET_RATION);
  }

  getGetAllOperatorList(): Observable<ApiResponse<OperatorList[]>> {
    return this.http.get<OperatorList[]>(API_ENDPOINTS.COMMON_API.GET_OPERATOR);
  }

  getGetAllOperatorsAndRationsList(): Observable<
    ApiResponse<OperatorsAndRationsList[]>
  > {
    return this.http.get<OperatorsAndRationsList[]>(
      API_ENDPOINTS.COMMON_API.GET_OPERATORS_AND_RATIONS,
    );
  }

  getAllCompany():Observable<ApiResponse<any>>{
    return this.http.get<ApiResponse<any>>(
      API_ENDPOINTS.COMMON_API.GET_ALL_TENANT
    )
  }
  getAnimalGroupByFarmID(
    FarmId: string,
  ): Observable<ApiResponse<AnimalGroupList[]>> {
    return this.http.get<AnimalGroupList[]>(
      `${API_ENDPOINTS.COMMON_API.GET_ANIMALGROUPS_BY_FARM_ID}?FarmId=${FarmId}`,
    );
  }
  getFeedByFarmID(FarmId: string): Observable<ApiResponse<FeedList[]>> {
    return this.http.get<FeedList[]>(
      `${API_ENDPOINTS.COMMON_API.GET_FEEDS_BY_FARM_ID}?FarmId=${FarmId}`,
    );
  }

  GetAllPlaceholderByCategoryId(
    categoryId: string,
  ): Observable<ApiResponse<TemplatePlaceholderList[]>> {
    return this.http.get<TemplatePlaceholderList[]>(
      `${API_ENDPOINTS.COMMON_API.GET_PLACEHOLDER_BY_CATEGORY_ID}?CategoryId=${categoryId}`,
    );
  }

  getFormulaList(): Observable<ApiResponse<FormulaList>> {
    return this.http.get<FormulaList>(
      API_ENDPOINTS.COMMON_API.GET_ALL_FORMULA_LIST,
    );
  }

  markAllReadNotifications(): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      API_ENDPOINTS.COMMON_API.MARK_ALL_READ_NOTIFICATION,
      {},
    );
  }

  updateNotification(Id: string): Observable<ApiResponse<any>> {
    const url = `${API_ENDPOINTS.COMMON_API.UPDATE_NOTIFICATION}?Id=${Id}`;
    return this.http.post<any>(url, {});
  }

  getDashboardData(): Observable<ApiResponse<DashboardData>> {
    return this.http.get<DashboardData>(
      API_ENDPOINTS.DASHBOARD.GET_DASHBOARD_DATA,
    );
  }

  getCompanyDashboardData(
    year: number,
    companyId?: string,
  ): Observable<ApiResponse<CompanyDashboardData>> {
    const companyQuery = companyId ? `&companyId=${companyId}` : '';
    return this.http.get<CompanyDashboardData>(
      `${API_ENDPOINTS.DASHBOARD.GET_COMPANY_DASHBOARD}?year=${year}${companyQuery}`,
    );
  }

  getAggregatedAnalytics(
    year: number,
  ): Observable<ApiResponse<AggregatedAnalyticsData>> {
    return this.http.get<AggregatedAnalyticsData>(
      `${API_ENDPOINTS.DASHBOARD.GET_AGGREGATED_ANALYTICS}?year=${year}`,
    );
  }

  getAggregatedArchive(payload: {
    year: number;
    period: string;
    companyId?: string | null;
  }): Observable<ApiResponse<AggregatedArchiveItem[]>> {
    return this.http.post<AggregatedArchiveItem[]>(
      API_ENDPOINTS.DASHBOARD.GET_AGGREGATED_ARCHIVE,
      payload,
    );
  }

  getAggregatedReport(payload: {
    year: number;
    period: string;
    companyId?: string | null;
  }): Observable<ApiResponse<AggregatedReportItem[]>> {
    return this.http.post<AggregatedReportItem[]>(
      API_ENDPOINTS.DASHBOARD.GET_AGGREGATED_REPORT,
      payload,
    );
  }

  getCompanyArchive(payload: {
    year: number;
    period: string;
    companyId?: string | null;
  }): Observable<ApiResponse<AggregatedArchiveItem[]>> {
    return this.http.post<AggregatedArchiveItem[]>(
      API_ENDPOINTS.DASHBOARD.GET_COMPANY_ARCHIVE,
      payload,
    );
  }

  getCompanyReport(payload: {
    year: number;
    period: string;
    companyId?: string | null;
  }): Observable<ApiResponse<AggregatedReportItem[]>> {
    return this.http.post<AggregatedReportItem[]>(
      API_ENDPOINTS.DASHBOARD.GET_COMPANY_REPORT,
      payload,
    );
  }

  updateCompanyArchive(payload: {
    reportDetailId: string;
    rationName?: string;
    animalCount?: number;
    avgMilkPerDay?: number;
  }): Observable<ApiResponse<string>> {
    return this.http.post<string>(
      API_ENDPOINTS.DASHBOARD.UPDATE_COMPANY_ARCHIVE,
      payload,
    );
  }

  exportCompanyReportPdf(payload: {
    year: number;
    period: string;
    companyId?: string | null;
  }): Observable<Blob> {
    return this.httpClient.post(
      `${this.baseUrl}${API_ENDPOINTS.DASHBOARD.EXPORT_COMPANY_REPORT_PDF}`,
      payload,
      { responseType: 'blob' },
    );
  }

  exportAggregatedReportPdf(payload: {
    year: number;
    period: string;
    companyId?: string | null;
  }): Observable<Blob> {
    return this.httpClient.post(
      `${this.baseUrl}${API_ENDPOINTS.DASHBOARD.EXPORT_AGGREGATED_REPORT_PDF}`,
      payload,
      { responseType: 'blob' },
    );
  }

  exportAggregatedReportCsv(payload: {
    year: number;
    period: string;
    companyId?: string | null;
  }): Observable<Blob> {
    return this.httpClient.post(
      `${this.baseUrl}${API_ENDPOINTS.DASHBOARD.EXPORT_AGGREGATED_REPORT_CSV}`,
      payload,
      { responseType: 'blob' },
    );
  }

  getSupplierList(): Observable<ApiResponse<SupplierList[]>> {
    return this.http.get<SupplierList[]>(
      API_ENDPOINTS.COMMON_API.GET_ALL_SUPPLIER_LIST,
    );
  }

  GetAllMaterialBySupplierId(
    supplierId: string,
    payload: any,
  ): Observable<ApiResponse<any>> {
    const url = `${API_ENDPOINTS.COMMON_API.GET_ALL_MATERIAL_BY_SUPPLIER_ID}?supplierId=${supplierId}`;
    return this.http.post<ApiResponse<any>>(url, payload);
  }

  getGetAllOperatorsAndMaterialList(): Observable<
    ApiResponse<OperatorsAndRationsList[]>
  > {
    return this.http.get<OperatorsAndRationsList[]>(
      API_ENDPOINTS.COMMON_API.GET_OPERATORS_AND_MATERIAL,
    );
  }

  GetAllMaterialBySupplierIdInFormula(supplierId: string,): Observable<ApiResponse<any>> {
    const url = `${API_ENDPOINTS.COMMON_API.GET_ALL_MATERIAL_BY_SUPPLIER_ID_IN_FORMULA}?supplierId=${supplierId}`;
    return this.http.get<ApiResponse<any>>(url);
  }

    getGetAllProductList(): Observable<ApiResponse<any[]>> {
    return this.http.get<any[]>(API_ENDPOINTS.COMMON_API.GET_PRODUCT,
    );
  }

  GetAllProductBySupplierId(supplierId: string,): Observable<ApiResponse<any>> {
    const url = `${API_ENDPOINTS.COMMON_API.GET_ALL_PRODUCT_BY_SUPPLIER_ID}?SupplierId=${supplierId}`;
    return this.http.get<ApiResponse<any>>(url);
  }

    GetAllFormulaBySupplierId(supplierId: string,): Observable<ApiResponse<any>> {
    const url = `${API_ENDPOINTS.COMMON_API.GET_ALL_FORMULA_BY_SUPPLIER_ID}?SupplierId=${supplierId}`;
    return this.http.get<ApiResponse<any>>(url);
  }
}
