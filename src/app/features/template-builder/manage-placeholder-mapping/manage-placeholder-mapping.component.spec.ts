import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagePlaceholderMappingComponent } from './manage-placeholder-mapping.component';

describe('ManagePlaceholderMappingComponent', () => {
  let component: ManagePlaceholderMappingComponent;
  let fixture: ComponentFixture<ManagePlaceholderMappingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManagePlaceholderMappingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManagePlaceholderMappingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
