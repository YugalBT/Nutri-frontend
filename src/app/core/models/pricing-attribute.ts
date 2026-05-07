export type AttributeType = 'Category' | 'Format' | 'Dosage' | 'Type';

export interface PricingAttribute {
  pricingAttributeId: string;
  attributeType: AttributeType;
  name: string;
  sortOrder: number;
  isActive: boolean;
}

export interface FormulaType {
  formulaTypeId: string;
  name: string;
  description: string | null;
  costDivisor: number;
  sortOrder: number;
  isActive: boolean;
}

export interface PricingAttributeCatalog {
  categories:   PricingAttribute[];
  formats:      PricingAttribute[];
  dosages:      PricingAttribute[];
  types:        PricingAttribute[];
  formulaTypes: FormulaType[];
}
