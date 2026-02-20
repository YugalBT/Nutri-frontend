import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplierPriceListComponent } from './supplier-price-list.component';

describe('SupplierPriceListComponent', () => {
  let component: SupplierPriceListComponent;
  let fixture: ComponentFixture<SupplierPriceListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupplierPriceListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SupplierPriceListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
