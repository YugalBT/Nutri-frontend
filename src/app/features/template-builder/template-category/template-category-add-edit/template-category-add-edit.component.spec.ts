import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TemplateCategoryAddEditComponent } from './template-category-add-edit.component';

describe('TemplateCategoryAddEditComponent', () => {
  let component: TemplateCategoryAddEditComponent;
  let fixture: ComponentFixture<TemplateCategoryAddEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TemplateCategoryAddEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TemplateCategoryAddEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
