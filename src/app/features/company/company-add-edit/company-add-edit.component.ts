import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SharedModule } from '../../../shared/shared.module';
import { TranslatePipe } from '../../../i18n/translate.pipe';
declare var bootstrap: any;
@Component({
  selector: 'app-company-add-edit',
  standalone: true,
  imports: [SharedModule, TranslatePipe],
  templateUrl: './company-add-edit.component.html',
  styleUrls: ['./company-add-edit.component.css']
})
export class CompanyAddEditComponent implements OnInit {
@ViewChild('companyModal') companyModal!: ElementRef;
  private modalInstance: any;
  form!: FormGroup;
  isEdit = false;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.form = this.fb.group({
      // Company details
      firstName: [''],
      middleName: [''],
      lastName: [''],
      code: [''],
      suffix: [''],
      url: [''],
      email: [''],
      phoneNumber: [''],
      logo: [''],
      primaryColor: ['#1d7e8b'],
      secondaryColor: [''],
      companyName: [''],

      // Primary user details
      userFirstName: [''],
      userMiddleName: [''],
      userLastName: [''],
      userEmail: [''],
      userPhoneNumber: [''],

      // Address
      streetAddress: [''],
      city: [''],
      country: [''],
      zipCode: [''],

      // Account
      password: [''],

      // legacy fields
      name: [''],
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

    this.modalInstance = new bootstrap.Modal(this.companyModal.nativeElement);
    this.modalInstance.show();
  }

  closeModal() {
    if (this.modalInstance) {
      this.modalInstance.hide();
    }
  }

  saveUser() {
    if (this.form.valid) {
      this.closeModal();
    }
  }

  onLogoChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      const file = input.files[0];
      // Store file name for now; adapt to upload flow as needed
      this.form.patchValue({ logo: file.name });
    }
  }
}
