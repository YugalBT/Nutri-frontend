import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EconomicReportListComponent } from './economic-report-list.component';

describe('EconomicReportListComponent', () => {
  let component: EconomicReportListComponent;
  let fixture: ComponentFixture<EconomicReportListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EconomicReportListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EconomicReportListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
