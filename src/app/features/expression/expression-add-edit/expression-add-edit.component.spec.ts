import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpressionAddEditComponent } from './expression-add-edit.component';

describe('ExpressionAddEditComponent', () => {
  let component: ExpressionAddEditComponent;
  let fixture: ComponentFixture<ExpressionAddEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpressionAddEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpressionAddEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
