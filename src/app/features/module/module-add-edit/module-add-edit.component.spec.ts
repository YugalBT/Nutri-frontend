import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModuleAddEditComponent } from './module-add-edit.component';

describe('ModuleAddEditComponent', () => {
  let component: ModuleAddEditComponent;
  let fixture: ComponentFixture<ModuleAddEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModuleAddEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModuleAddEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
