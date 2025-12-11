import { TestBed } from '@angular/core/testing';

import { AnimaltypeService } from './animaltype.service';

describe('AnimaltypeService', () => {
  let service: AnimaltypeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AnimaltypeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
