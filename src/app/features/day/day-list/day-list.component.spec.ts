import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DayListComponent } from './day-list.component';

describe('DayListComponent', () => {
  let component: DayListComponent;
  let fixture: ComponentFixture<DayListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DayListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DayListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
