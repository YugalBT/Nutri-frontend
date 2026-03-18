import { TestBed } from '@angular/core/testing';

import { AnimallactationService } from './animallactation.service';

describe('AnimallactationService', () => {
  let service: AnimallactationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AnimallactationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
