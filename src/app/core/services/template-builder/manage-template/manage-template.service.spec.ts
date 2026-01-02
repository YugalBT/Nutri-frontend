import { TestBed } from '@angular/core/testing';

import { ManageTemplateService } from './manage-template.service';

describe('ManageTemplateService', () => {
  let service: ManageTemplateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ManageTemplateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
