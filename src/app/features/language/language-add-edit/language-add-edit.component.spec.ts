import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LanguageAddEditComponent } from './language-add-edit.component';

describe('LanguageAddEditComponent', () => {
  let component: LanguageAddEditComponent;
  let fixture: ComponentFixture<LanguageAddEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LanguageAddEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LanguageAddEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
