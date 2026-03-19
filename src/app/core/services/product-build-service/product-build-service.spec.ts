import { TestBed } from '@angular/core/testing';

import { ProductBuildService } from './product-build-service';

describe('ProductBuildServiceService', () => {
  let service: ProductBuildService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProductBuildService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
