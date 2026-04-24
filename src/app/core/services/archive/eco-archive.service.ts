import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../../constants/api-endpoints';
import { ApiResponse } from '../../models/api-response';
import { HttpService } from '../../../shared/services/http.service';

export interface EcoArchiveRecord {
  dayGroupDataId: string;
  dayId: string;
  companyId?: string;
  companyName?: string;
  date?: string;

  // Identity
  animalGroupName?: string;
  rationName?: string;
  categoryCode?: string;

  // Herd
  totalHeads?: number;

  // Intake
  kgTq?: number;
  kgDischarged?: number;
  leftover?: number;

  // Cost
  rationCostEur?: number;
  iofcPerCow?: number;

  // Milk (day-level)
  milkDeliveredKg?: number;
  milkProducedKg?: number;
  milkPriceEurLitre?: number;
  milkRevenueEur?: number;
  deaMilk?: number;
  totalFeedCostEur?: number;
  averageFeedKgPerHead?: number;
  priceType?: number;
}

export interface EcoArchiveParams {
  fromDate: string;
  toDate: string;
  pageNo: number;
  pageSize: number;
  companyId?: string;
}

@Injectable({ providedIn: 'root' })
export class EcoArchiveService {
  constructor(private http: HttpService) {}

  getEcoArchive(params: EcoArchiveParams): Observable<ApiResponse<EcoArchiveRecord[]>> {
    let url = `${API_ENDPOINTS.DAY_DATA.ECO_ARCHIVE}?fromDate=${params.fromDate}&toDate=${params.toDate}&pageNo=${params.pageNo}&pageSize=${params.pageSize}`;
    if (params.companyId) {
      url += `&companyId=${params.companyId}`;
    }
    return this.http.get<EcoArchiveRecord[]>(url);
  }
}
