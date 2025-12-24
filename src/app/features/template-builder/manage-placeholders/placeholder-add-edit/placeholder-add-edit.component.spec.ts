import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaceholderAddEditComponent } from './placeholder-add-edit.component';

describe('PlaceholderAddEditComponent', () => {
  let component: PlaceholderAddEditComponent;
  let fixture: ComponentFixture<PlaceholderAddEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlaceholderAddEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlaceholderAddEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
