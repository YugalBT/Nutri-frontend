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
}

export interface CompanyDashboardData {
  companyId: string;
  companyName: string;
  year: number;
  lastEntryDate?: string | null;
  milkPrice: number;
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
