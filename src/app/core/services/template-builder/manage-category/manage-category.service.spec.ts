import { TestBed } from '@angular/core/testing';
import { ManageCategoryService } from './manage-category.service';


describe('ManageCategoryService', () => {
  let service: ManageCategoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ManageCategoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
