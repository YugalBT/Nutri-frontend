import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TechnicalReportAddEditComponent } from './technical-report-add-edit.component';

describe('TechnicalReportAddEditComponent', () => {
  let component: TechnicalReportAddEditComponent;
  let fixture: ComponentFixture<TechnicalReportAddEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TechnicalReportAddEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TechnicalReportAddEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
