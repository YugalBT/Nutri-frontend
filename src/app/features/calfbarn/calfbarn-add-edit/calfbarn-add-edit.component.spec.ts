import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalfbarnAddEditComponent } from './calfbarn-add-edit.component';

describe('CalfbarnAddEditComponent', () => {
  let component: CalfbarnAddEditComponent;
  let fixture: ComponentFixture<CalfbarnAddEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalfbarnAddEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalfbarnAddEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
