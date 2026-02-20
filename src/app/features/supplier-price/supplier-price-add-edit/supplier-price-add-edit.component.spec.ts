import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplierPriceAddEditComponent } from './supplier-price-add-edit.component';

describe('SupplierPriceAddEditComponent', () => {
  let component: SupplierPriceAddEditComponent;
  let fixture: ComponentFixture<SupplierPriceAddEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupplierPriceAddEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SupplierPriceAddEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
