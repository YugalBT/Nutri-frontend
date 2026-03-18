export interface TechnicalReportDetails {
  rationId: string;
  rationName: string;
  animalGroup: AnimalGroup;
  farm: Farm;
  feeds: Feed[];
  global: Global[];
}

export interface AnimalGroup {
  id: string;
  name: string;
  lactationStageId: string;
  lactationStageName: string;
  numberOfAnimals: number;
  avgMilkPerDay: number;
}

export interface Farm {
  id: string;
  name: string;
  milkPrice: number;
}

export interface Feed {
  feedId: string;
  feedName: string;
  quantity_kg: number;
  totalPerFeed: number;
  kpIs: KpI[];
}

export interface KpI {
  kpiId: string;
  kpiName: string;
  value: number;
}

export interface Global {
  name: string;
  value: number;
}
