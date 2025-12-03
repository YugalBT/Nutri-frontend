import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedAddEditComponent } from './feed-add-edit.component';

describe('FeedAddEditComponent', () => {
  let component: FeedAddEditComponent;
  let fixture: ComponentFixture<FeedAddEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeedAddEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FeedAddEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
