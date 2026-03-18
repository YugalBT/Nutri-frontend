import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnimalLactationAddEditComponent } from './animal-lactation-add-edit.component';

describe('AnimalLactationAddEditComponent', () => {
  let component: AnimalLactationAddEditComponent;
  let fixture: ComponentFixture<AnimalLactationAddEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnimalLactationAddEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnimalLactationAddEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
