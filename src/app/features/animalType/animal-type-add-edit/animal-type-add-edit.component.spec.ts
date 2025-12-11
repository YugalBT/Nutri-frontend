import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnimalTypeAddEditComponent } from './animal-type-add-edit.component';

describe('AnimalTypeAddEditComponent', () => {
  let component: AnimalTypeAddEditComponent;
  let fixture: ComponentFixture<AnimalTypeAddEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnimalTypeAddEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnimalTypeAddEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
