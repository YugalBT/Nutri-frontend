import { TestBed } from '@angular/core/testing';

import { SupplierPricingSettingService } from './supplier-pricing-setting.service';

describe('SupplierPricingSettingService', () => {
  let service: SupplierPricingSettingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SupplierPricingSettingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
