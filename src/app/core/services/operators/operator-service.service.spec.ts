import { TestBed } from '@angular/core/testing';

import { OperatorServiceService } from './operator-service.service';

describe('OperatorServiceService', () => {
  let service: OperatorServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OperatorServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
