import { TestBed } from '@angular/core/testing';
import { CalfbarnService } from './calfbarn.service';



describe('CalfbarnService', () => {
  let service: CalfbarnService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CalfbarnService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
