import { TestBed } from '@angular/core/testing';

import { RationListService } from './ration-list.service';

describe('RationListService', () => {
  let service: RationListService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RationListService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
