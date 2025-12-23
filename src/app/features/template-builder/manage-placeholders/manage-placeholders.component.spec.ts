import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagePlaceholdersComponent } from './manage-placeholders.component';

describe('ManagePlaceholdersComponent', () => {
  let component: ManagePlaceholdersComponent;
  let fixture: ComponentFixture<ManagePlaceholdersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManagePlaceholdersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManagePlaceholdersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
