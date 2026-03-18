import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpressionListComponent } from './expression-list.component';

describe('ExpressionListComponent', () => {
  let component: ExpressionListComponent;
  let fixture: ComponentFixture<ExpressionListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpressionListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpressionListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
