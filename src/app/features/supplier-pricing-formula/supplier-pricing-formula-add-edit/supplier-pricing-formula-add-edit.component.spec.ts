import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplierPricingFormulaAddEditComponent } from './supplier-pricing-formula-add-edit.component';

describe('SupplierPricingFormulaAddEditComponent', () => {
  let component: SupplierPricingFormulaAddEditComponent;
  let fixture: ComponentFixture<SupplierPricingFormulaAddEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupplierPricingFormulaAddEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SupplierPricingFormulaAddEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
