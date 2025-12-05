import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RationAddEditComponent } from './ration-add-edit.component';

describe('RationAddEditComponent', () => {
  let component: RationAddEditComponent;
  let fixture: ComponentFixture<RationAddEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RationAddEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RationAddEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
