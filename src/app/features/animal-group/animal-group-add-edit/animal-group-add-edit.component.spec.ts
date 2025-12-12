import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnimalGroupAddEditComponent } from './animal-group-add-edit.component';

describe('AnimalGroupAddEditComponent', () => {
  let component: AnimalGroupAddEditComponent;
  let fixture: ComponentFixture<AnimalGroupAddEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnimalGroupAddEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnimalGroupAddEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
