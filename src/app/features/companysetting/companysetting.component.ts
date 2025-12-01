import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { ToastService } from '../../shared/services/toast.service';
import { CompanysettingService } from '../../core/services/company-setting/companysetting.service';
import { take } from 'rxjs';

@Component({
  selector: 'app-companysetting',
  standalone: true,
  imports: [ReactiveFormsModule, SharedModule],
  templateUrl: './companysetting.component.html',
  styleUrl: './companysetting.component.css'
})
export class CompanysettingComponent implements OnInit {

  companyForm!: FormGroup;
  imagePreview: string | null = null;
  @ViewChild('fileInput') fileInput!: ElementRef;

  constructor(
    private fb: FormBuilder,
    private toast: ToastService,
    private companyService: CompanysettingService
  ) { }

  ngOnInit(): void {
    this.setupForm();

    this.companyService.companyDetails().pipe(take(1)).subscribe((res: any) => {
      if (res.isSuccess && res.data) {
        this.companyForm.patchValue(res.data);
        this.imagePreview = res.data.logo;
      } else {
        this.toast.error(res.message || 'Error loading settings');
      }
    });
  }

  setupForm() {
    this.companyForm = this.fb.group({
      logo: [null],
      companyName: ['', Validators.required],
      primaryColor: ['#000000'],
      secondaryColor: ['#ffffff'],
      email: ['', Validators.email],
      phoneNumber: ['', [Validators.pattern('^[0-9]{10}$')]],
      streetAddress: ['', [Validators.maxLength(100)]],

      // REQUIRED FIELDS FROM BACKEND
      city: ['', [
        Validators.required,
        Validators.maxLength(50),
        Validators.minLength(1),
        Validators.pattern("^[\\p{L} .'-]+$")
      ]],
      country: ['', [
        Validators.required,
        Validators.maxLength(50),
        Validators.minLength(1),
        Validators.pattern("^[\\p{L} .'-]+$")
      ]],
      zipCode: ['', [
        Validators.required,
        Validators.pattern("^\\d{5,6}$")  // 5 OR 6 digits only
      ]],

      effectiveDate: [null],
      expiryDate: [null]
    });
  }

  onImageChange(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    if (!['image/png', 'image/jpeg'].includes(file.type)) {
      this.toast.error("Only JPG / PNG allowed");
      this.fileInput.nativeElement.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
      this.companyForm.patchValue({ logo: reader.result });
    };
    reader.readAsDataURL(file);
  }

  removeImage() {
    this.imagePreview = null;
    this.companyForm.patchValue({ logo: null });
    this.fileInput.nativeElement.value = '';
  }

  onSubmit() {
    if (this.companyForm.invalid) {
      this.toast.error("Please fill all required fields correctly");
      return;
    }

    const payload = this.companyForm.getRawValue();

    this.companyService.updateCompanySetting(payload).subscribe({
      next: (res: any) => {
        if (res.isSuccess) this.toast.success("Company Settings Updated");
        else this.toast.error(res.message);
      },
      error: (err: any) => {
        this.toast.error(err?.error?.message || "Error updating settings");
      }
    });
  }
}
