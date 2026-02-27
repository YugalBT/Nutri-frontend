import { TestBed } from '@angular/core/testing';

import { SupplierPricingFormulaService } from './supplier-pricing-formula.service';

describe('SupplierPricingFormulaService', () => {
  let service: SupplierPricingFormulaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SupplierPricingFormulaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
