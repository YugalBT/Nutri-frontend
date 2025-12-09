import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalvesListComponent } from './calves-list.component';

describe('CalvesListComponent', () => {
  let component: CalvesListComponent;
  let fixture: ComponentFixture<CalvesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalvesListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalvesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
