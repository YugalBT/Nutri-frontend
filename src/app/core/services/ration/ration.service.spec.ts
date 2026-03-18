import { TestBed } from '@angular/core/testing';
import { RationService } from './ration.service';


describe('RationService', () => {
  let service: RationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
