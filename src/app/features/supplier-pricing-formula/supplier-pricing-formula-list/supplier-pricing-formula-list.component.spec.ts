import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplierPricingFormulaListComponent } from './supplier-pricing-formula-list.component';

describe('SupplierPricingFormulaListComponent', () => {
  let component: SupplierPricingFormulaListComponent;
  let fixture: ComponentFixture<SupplierPricingFormulaListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupplierPricingFormulaListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SupplierPricingFormulaListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
