import { TestBed } from '@angular/core/testing';

import { CompanysettingService } from './companysetting.service';

describe('CompanysettingService', () => {
  let service: CompanysettingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CompanysettingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
