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
}
