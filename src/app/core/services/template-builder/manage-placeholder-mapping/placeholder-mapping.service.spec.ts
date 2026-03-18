import { TestBed } from '@angular/core/testing';

import { PlaceholderMappingService } from './placeholder-mapping.service';

describe('PlaceholderMappingService', () => {
  let service: PlaceholderMappingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlaceholderMappingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
