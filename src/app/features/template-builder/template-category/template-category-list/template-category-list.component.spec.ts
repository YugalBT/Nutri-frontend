import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TemplateCategoryListComponent } from './template-category-list.component';

describe('TemplateCategoryListComponent', () => {
  let component: TemplateCategoryListComponent;
  let fixture: ComponentFixture<TemplateCategoryListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TemplateCategoryListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TemplateCategoryListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
