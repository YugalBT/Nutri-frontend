import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalvesAddEditComponent } from './calves-add-edit.component';

describe('CalvesAddEditComponent', () => {
  let component: CalvesAddEditComponent;
  let fixture: ComponentFixture<CalvesAddEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalvesAddEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalvesAddEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
