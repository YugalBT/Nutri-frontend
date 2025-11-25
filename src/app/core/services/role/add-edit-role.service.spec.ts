import { TestBed } from '@angular/core/testing';

import { AddEditRoleService } from './add-edit-role.service';

describe('AddEditRoleService', () => {
  let service: AddEditRoleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AddEditRoleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
