import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnimalLactationListComponent } from './animal-lactation-list.component';

describe('AnimalLactationListComponent', () => {
  let component: AnimalLactationListComponent;
  let fixture: ComponentFixture<AnimalLactationListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnimalLactationListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnimalLactationListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
