import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaceholderMappingAddEditComponent } from './placeholder-mapping-add-edit.component';

describe('PlaceholderMappingAddEditComponent', () => {
  let component: PlaceholderMappingAddEditComponent;
  let fixture: ComponentFixture<PlaceholderMappingAddEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlaceholderMappingAddEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlaceholderMappingAddEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
