import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyAddEditComponent } from './company-add-edit.component';

describe('CompanyAddEditComponent', () => {
  let component: CompanyAddEditComponent;
  let fixture: ComponentFixture<CompanyAddEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompanyAddEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompanyAddEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
