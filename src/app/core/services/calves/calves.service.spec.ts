import { TestBed } from '@angular/core/testing';

import { CalvesService } from './calves.service';

describe('CalvesService', () => {
  let service: CalvesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CalvesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
