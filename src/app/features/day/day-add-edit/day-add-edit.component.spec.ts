import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DayAddEditComponent } from './day-add-edit.component';

describe('DayAddEditComponent', () => {
  let component: DayAddEditComponent;
  let fixture: ComponentFixture<DayAddEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DayAddEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DayAddEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
