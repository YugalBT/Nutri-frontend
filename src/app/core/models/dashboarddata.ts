/**
 * A custom KPI evaluated against a company's aggregated data.
 * Returned inside CompanyDashboardData.customKpis.
 */
export interface CustomKpiResult {
  kpiId: string;
  kpiName: string;
  value: number;
  /** card | gauge | chart_line | chart_bar */
  displayType: 'card' | 'gauge' | 'chart_line' | 'chart_bar';
  /** company | admin | both */
  displayLocation: 'company' | 'admin' | 'both';
  gaugeMin: number;
  gaugeMax: number;
  sortOrder: number;
  /** false if formula referenced an unavailable variable or produced a math error */
  isValid: boolean;
}

export interface DashboardData {
  totalCompanies: number;
  totalUsers: number;
  totalActiveUsers: number;
  totalInActiveUsers: number;
  totalFarms: number;
  totalRations: number;
  totalActiveFarms: number;
  totalSuppliers: number;
}

export interface KpiTrendPoint {
  label: string;
  iofc: number;
  deaMilk: number;
  cost: number;
  feedEfficiency?: number;
  crep?: number;
  avgMilkPerDay?: number;
}

export interface CompanyDashboardData {
  companyId: string;
  companyName: string;
  year: number;
  lastEntryDate?: string | null;
  milkPrice: number;
  totalMilkRevenue?: number;
  iofc: number;
  deaMilk: number;
  cost: number;
  herdSize: number;
  avgMilkPerDay: number;
  kpiTrend: KpiTrendPoint[];
  feedEfficiency?: number;
  crep?: number;
  totalCalves?:number;
  fiber?:number;
  milkFeed?:number;
  costPerDairyCowRation?: number;
  costPerDryCowRation?: number;
  heiferRearingCost?: number;
  animalsInLactation?: number;
  dryAnimals?: number;
  heiferPercentage?: number;
  milkProduced?: number;
  fatPercent?: number;
  proteinPercent?: number;
  pim?: number;
  ageAtFirstCalvingHeifers?: number;
  /** Custom KPIs defined by the Super Admin, evaluated for this company. */
  customKpis?: CustomKpiResult[];
}

export interface CompanyComparisonData {
  companyId: string;
  companyName: string;
  farmCount: number;
  iofc: number;
  deaMilk: number;
  cost: number;
  avgMilkPerDay: number;
}

export interface CompanyRankingData {
  companyId: string;
  companyName: string;
  iofc: number;
  rank: number;
}

export interface AggregatedAnalyticsData {
  year: number;
  totalCompanies: number;
  archiveRecords: number;
  companyComparison: CompanyComparisonData[];
  rankingByIofc: CompanyRankingData[];
  monthlyTrend: KpiTrendPoint[];
  costPerDairyCowRation?: number;
  costPerDryCowRation?: number;
  heiferRearingCost?: number;
  animalsInLactation?: number;
  dryAnimals?: number;
  heiferPercentage?: number;
  milkProduced?: number;
  fatPercent?: number;
  proteinPercent?: number;
  pim?: number;
  crep?: number;
  ageAtFirstCalvingHeifers?: number;
}

export interface AggregatedArchiveItem {
  reportDetailId: string;
  companyId?: string | null;
  companyName: string;
  createdAt: string;
  rationName: string;
  animalCount: number;
  avgMilkPerDay: number;
}

export interface AggregatedReportItem {
  periodLabel: string;
  reports: number;
  animalCount: number;
  avgMilkPerDay: number;
  iofc: number;
  deaMilk: number;
  cost: number;
}
