export interface FeedList {
    feedName?: string;
	feedId?: string;
	category?: string;

  dryMatter: number;
  protein: number;
  pricePerKg: number;

  // optional (future use)
  ndf?: number;
  energy?: number;
  adf?: number;
  fatContent?: number;
  calcium?: number;
  phosphorus?: number;
  starch?: number | null;
	isActive?: boolean;
	[key: string]: any;
}

