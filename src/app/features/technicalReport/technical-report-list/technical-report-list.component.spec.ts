import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TechnicalReportListComponent } from './technical-report-list.component';

describe('TechnicalReportListComponent', () => {
  let component: TechnicalReportListComponent;
  let fixture: ComponentFixture<TechnicalReportListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TechnicalReportListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TechnicalReportListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
