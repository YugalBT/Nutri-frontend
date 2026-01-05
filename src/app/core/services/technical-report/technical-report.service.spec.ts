import { TestBed } from '@angular/core/testing';

import { TechnicalReportService } from './technical-report.service';

describe('TechnicalReportService', () => {
  let service: TechnicalReportService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TechnicalReportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
