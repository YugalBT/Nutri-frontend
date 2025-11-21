import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SharedModule } from '../../../shared/shared.module';
import { TranslatePipe } from '../../../i18n/translate.pipe';
declare var bootstrap: any;

@Component({
  selector: 'app-role-add-edit',
  standalone: true,
  imports: [SharedModule, TranslatePipe],
  templateUrl: './role-add-edit.component.html',
  styleUrls: ['./role-add-edit.component.css']
})
export class RoleAddEditComponent implements OnInit {
  @ViewChild('roleModal') roleModal!: ElementRef;
  private modalInstance: any;
  form!: FormGroup;
  isEdit = false;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      isActive: [true]
    });
  }

  openModal(edit = false, data?: any) {
    this.isEdit = edit;
    if (edit && data) {
      this.form.patchValue(data);
    } else {
      this.form.reset({ isActive: true });
    }

    this.modalInstance = new bootstrap.Modal(this.roleModal.nativeElement);
    this.modalInstance.show();
  }

  closeModal() {
    if (this.modalInstance) {
      this.modalInstance.hide();
    }
  }

  saveRole() {
    if (this.form.valid) {
      this.closeModal();
    }
  }
}
