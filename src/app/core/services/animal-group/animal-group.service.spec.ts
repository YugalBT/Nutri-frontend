import { TestBed } from '@angular/core/testing';

import { AnimalGroupService } from './animal-group.service';

describe('AnimalGroupService', () => {
  let service: AnimalGroupService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AnimalGroupService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
