export interface PricingRule {
  pricingRuleId: string;
  category: string;
  format: string | null;   // null = category-level default
  dosage: string | null;   // null = format-level (all dosages)
  targetMargin: number;
  minMargin: number;
  commissionPct: number;
  formulaType: 'Standard' | 'NutriJunior';
  isActive: boolean;
  ruleLevel: 'Category' | 'Format' | 'Dosage';
}

export interface CalculatedPriceVm {
  ruleApplied: string;
  customerPrice: number;
  targetMargin: number;
  minMargin: number;
  commissionPct: number;
  commissionAmount: number;
  formulaType: string;
  ruleFound: boolean;
}

export interface CalculatePriceRequest {
  category: string;
  format: string | null;
  dosage: string | null;
  formulaCost: number;
}
