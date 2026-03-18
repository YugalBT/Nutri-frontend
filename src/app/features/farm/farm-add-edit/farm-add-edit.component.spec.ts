import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FarmAddEditComponent } from './farm-add-edit.component';

describe('FarmAddEditComponent', () => {
  let component: FarmAddEditComponent;
  let fixture: ComponentFixture<FarmAddEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FarmAddEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FarmAddEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
