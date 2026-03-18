import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaceholderMappingListComponent } from './placeholder-mapping-list.component';

describe('PlaceholderMappingListComponent', () => {
  let component: PlaceholderMappingListComponent;
  let fixture: ComponentFixture<PlaceholderMappingListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlaceholderMappingListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlaceholderMappingListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
