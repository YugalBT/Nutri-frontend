import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApiEndpointsComponent } from './api-endpoints.component';

describe('ApiEndpointsComponent', () => {
  let component: ApiEndpointsComponent;
  let fixture: ComponentFixture<ApiEndpointsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApiEndpointsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApiEndpointsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
