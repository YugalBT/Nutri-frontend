import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductPriceAddEditComponent } from './product-price-add-edit.component';

describe('ProductPriceAddEditComponent', () => {
  let component: ProductPriceAddEditComponent;
  let fixture: ComponentFixture<ProductPriceAddEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductPriceAddEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductPriceAddEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
