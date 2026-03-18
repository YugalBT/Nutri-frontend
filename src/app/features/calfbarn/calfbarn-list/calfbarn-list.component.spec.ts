import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalfbarnListComponent } from './calfbarn-list.component';

describe('CalfbarnListComponent', () => {
  let component: CalfbarnListComponent;
  let fixture: ComponentFixture<CalfbarnListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalfbarnListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalfbarnListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
