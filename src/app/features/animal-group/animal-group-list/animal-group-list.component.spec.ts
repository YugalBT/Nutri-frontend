import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnimalGroupListComponent } from './animal-group-list.component';

describe('AnimalGroupListComponent', () => {
  let component: AnimalGroupListComponent;
  let fixture: ComponentFixture<AnimalGroupListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnimalGroupListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnimalGroupListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
