export interface TechnicalReportDetails {

    rationId: string
    rationName: string
    animalGroupId: string
    animalGroupName: string
    avgMilkPerDay: number
    numberOfAnimal: number
    feeds: Feed[]
}

export interface Feed {
    feedId: string
    feedName: string
    dryMatter: number
    protein: number
    energy: number
    adf: number
    fatContent: number
    calcium: number
    phosphorus: number
    starch: number
    quantityPerKg: number
    kpIs: KpI[]
}

export interface KpI {
    kpiId: string
    kpiName: string
    formula: string
    calculatedValue: number
}

export interface FeedTotals {
  quantityPerKg: number;
  dryMatter: number;
  protein: number;
  energy: number;
  adf: number;
  fatContent: number;
  calcium: number;
  phosphorus: number;
  starch: number;
}



