import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SharedModule } from '../../../shared/shared.module';
import { TranslatePipe } from '../../../i18n/translate.pipe';
import { Company } from '../../../core/models/company-add-edit';
import { CompanyService } from '../../../core/services/company/company.service';
import { ToastService } from '../../../shared/services/toast.service';
import { ApiResponse } from '../../../core/models/api-response';
import { Output, EventEmitter } from '@angular/core';


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

  constructor(
  private fb: FormBuilder,
  private companyService: CompanyService,
   private toast: ToastService
) {}

  // constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.form = this.fb.group({
      // Company details
      tenantId: [''],
      firstName: ['',Validators.required],
      middleName: [''],
      lastName: ['', Validators.required],
      code: ['', [Validators.required, Validators.minLength(3)]],
      suffix: ['', Validators.required],
      url: ['', Validators.required],
    //  url: ['', [Validators.required, Validators.pattern(/^(https?:\/\/)?([\w.-]+)+[\w-]+(\/[\w-]*)*\/?$/)]],
      email: ['', [Validators.required, Validators.email]],
      PhoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10,15}$/)]],
      logo: ['', Validators.required],
      primaryColor: ['#1d7e8b', Validators.required],
      secondaryColor: [''],
      companyName: ['', [Validators.required, Validators.pattern(/^[A-Za-z\s]+$/)]],
      // Primary user details
      userFirstName: ['', Validators.required],
      userMiddleName: [''],
      userLastName: ['', Validators.required],
      userEmail: ['', [Validators.required, Validators.email]],
      userPhoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10,15}$/)]],
      // Address
      streetAddress: ['', Validators.required],
      city: ['', Validators.required],
      country: ['', Validators.required],
      zipCode: ['', Validators.required],

      // Account
      password: ['', [Validators.required, Validators.minLength(8)]],

      // legacy fields
      name: [''],
      description: [''],
      isActive: [true]
    });
  }

  openModal(edit = false, data?: any) {
    this.isEdit = edit;
    if (edit && data) {
      this.form.patchValue({ ...data, logo: data.logo || '' });
      // this.form.patchValue(data);
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

  if (input.files && input.files.length > 0) {
    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      this.form.patchValue({ logo: reader.result as string });
    };

    reader.readAsDataURL(file);
  }
}


 saveCompany() {
  if (this.form.invalid) {
    this.form.markAllAsTouched();
    return;
  }

  const payload = this.form.value as Company;

  if (this.isEdit) {

    this.companyService.updateCompany(payload).subscribe({
      next: (res: ApiResponse<any>) => {
        if (res?.isSuccess) {
          this.toast.success(res.message || "Company updated successfully!");
          this.companyService.notifyCompaniesChanged();
          this.closeModal();
           
        } else {
          this.toast.error(res.message || "Update failed");
        }
      },
      error: (err: any) => {
        if (err.error?.errors) {
          Object.values(err.error.errors).forEach((msgList: any) => {
            msgList.forEach((msg: string) => this.toast.error(msg));
          });
        } else {
          this.toast.error("Something went wrong");
        }
      }
    });

  } else {
  this.companyService.createCompany(payload).subscribe({
    next: (res) => {

      if (res?.isSuccess) {
        this.toast.success(res.message || "Company created successfully!");
        this.companyService.notifyCompaniesChanged();
        this.closeModal();
      } else {
        this.toast.error(res.message || "Failed to create company");
      }
    },

    error: (err) => {
      console.error("Create Error:", err);

      // Backend validation errors (.NET model state)
      if (err.error?.errors) {
        Object.values(err.error.errors).forEach((messages: any) => {
          messages.forEach((msg: string) => this.toast.error(msg));
        });
      } 
      else {
        // Generic fallback
        this.toast.error("Something went wrong. Please try again.");
      }
    }
  });
}
}

deleteCompany(id: string) {
  this.companyService.deleteCompany(id).subscribe({
    next: (res: ApiResponse<any>) => {
      if (res.isSuccess) {
        this.toast.success(res.message || "Company deleted successfully!");
      } else {
        this.toast.error(res.message || "Delete failed");
      }
    },
    error: () => {
      this.toast.error("Something went wrong");
    }
  });
}

activeInactiveCompany(id: string) {
  this.companyService.ativeInactiveCompanyStatus(id, !this.form.value.isActive).subscribe({
    next: (res: ApiResponse<any>) => {
      if (res.isSuccess) {
        this.toast.success(res.message || "Company Inactivated successfully!");
      } else {
        this.toast.error(res.message || "Inactivation failed");
      }
    },
    error: () => {
      this.toast.error("Something went wrong");
    }
  });
}
}
  

