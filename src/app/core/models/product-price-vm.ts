export interface ProductSellingPriceVm {

  productPriceId?: string;

  productId: string;

  priceMonth: string;

  previousMonthPrice: number;

  suggestedPrice: number;

  customerPrice: number;

  commissionPercent: number;

  marginPercent: number;

  marginLevel?: number;

  marginColor?: string;

  isSpecialCategory?: boolean;

  formulaCost?: number;

}

export interface SuggestedPriceVm {

  productId: string;

  category?: string;

  format?: string;

  dosage?: string;

  type?: string;

  formulaCost: number;

  suggestedPrice: number;

  targetMarginPercent: number;

  commissionPercent: number;

  formulaType?: string;

  ruleApplied?: string;

  ruleFound?: boolean;

  isSpecialCategory: boolean;

  minThreshold: number;

  midThreshold: number;

  highThreshold: number;

}
