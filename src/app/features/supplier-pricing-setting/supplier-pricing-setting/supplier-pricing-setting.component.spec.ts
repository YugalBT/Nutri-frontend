import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplierPricingSettingComponent } from './supplier-pricing-setting.component';

describe('SupplierPricingSettingComponent', () => {
  let component: SupplierPricingSettingComponent;
  let fixture: ComponentFixture<SupplierPricingSettingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupplierPricingSettingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SupplierPricingSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
