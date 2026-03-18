import { TestBed } from '@angular/core/testing';

import { ProductSellingPriceService } from './product-selling-price.service';

describe('ProductSellingPriceService', () => {
  let service: ProductSellingPriceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProductSellingPriceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
