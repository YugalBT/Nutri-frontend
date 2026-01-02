import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KpiAddEditComponent } from './kpi-add-edit.component';

describe('DayAddEditComponent', () => {
  let component: KpiAddEditComponent;
  let fixture: ComponentFixture<KpiAddEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KpiAddEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KpiAddEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
