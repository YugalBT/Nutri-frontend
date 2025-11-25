import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserRoleAddEditComponent } from './role-add-edit.component';

describe('RoleAddEditComponent', () => {
  let component: UserRoleAddEditComponent;
  let fixture: ComponentFixture<UserRoleAddEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserRoleAddEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserRoleAddEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
