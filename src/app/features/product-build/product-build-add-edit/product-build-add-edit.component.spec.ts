import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductBuildAddEditComponent } from './product-build-add-edit.component';

describe('ProductBuildAddEditComponent', () => {
  let component: ProductBuildAddEditComponent;
  let fixture: ComponentFixture<ProductBuildAddEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductBuildAddEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductBuildAddEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
