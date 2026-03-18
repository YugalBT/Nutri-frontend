import { TestBed } from '@angular/core/testing';
import { ManagePlaceholderService } from './manage-placeholder.service';


describe('ManagePlaceholderService', () => {
  let service: ManagePlaceholderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ManagePlaceholderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
