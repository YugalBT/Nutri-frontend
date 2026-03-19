import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductBuildListComponent } from './product-build-list.component';

describe('ProductBuildListComponent', () => {
  let component: ProductBuildListComponent;
  let fixture: ComponentFixture<ProductBuildListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductBuildListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductBuildListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
