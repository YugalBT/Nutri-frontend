import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RationItemsComponent } from './ration-items.component';

describe('RationItemsComponent', () => {
  let component: RationItemsComponent;
  let fixture: ComponentFixture<RationItemsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RationItemsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RationItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
