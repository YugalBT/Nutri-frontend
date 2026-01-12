import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EconomicReportAddEditComponent } from './economic-report-add-edit.component';

describe('EconomicReportAddEditComponent', () => {
  let component: EconomicReportAddEditComponent;
  let fixture: ComponentFixture<EconomicReportAddEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EconomicReportAddEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EconomicReportAddEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
