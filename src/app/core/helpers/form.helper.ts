import { FormBuilder, Validators } from '@angular/forms';

export class FormHelper {
  constructor(private fb: FormBuilder) {}

  createContactForm() {
    return this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      mobile: ['', Validators.pattern(/^[0-9]{10}$/)]
    });
  }
  ConvertToFormData(data: any): FormData {
    var formData = new FormData();
    Object.keys(data).forEach(key => {
      if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });
    return formData;
  }
}
