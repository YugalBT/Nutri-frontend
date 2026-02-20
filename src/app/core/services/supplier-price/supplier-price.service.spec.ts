import { TestBed } from '@angular/core/testing';

import { SupplierPriceService } from './supplier-price.service';

describe('SupplierPriceService', () => {
  let service: SupplierPriceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SupplierPriceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
