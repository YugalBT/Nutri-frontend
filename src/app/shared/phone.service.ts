import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class PhoneService {

  constructor() {}

  /**
   * Allow only digits and limit length
   * @param event Input event
   * @param form Reactive form
   * @param controlName FormControl name
   * @param maxLength Maximum digits (default 10)
   */
  enforcePhoneInput(
    event: Event,
    form: FormGroup,
    controlName: string,
    maxLength: number = 10
  ): void {
    const input = event.target as HTMLInputElement;

    // Keep digits only
    let value = input.value.replace(/\D/g, '');

    // Enforce max length
    if (value.length > maxLength) {
      value = value.slice(0, maxLength);
    }

    // Update UI and FormControl
    input.value = value;
    form.get(controlName)?.setValue(value, { emitEvent: false });
  }

  /**
   * Optional: validate phone length
   */
  isValidPhone(value: string, length: number = 10): boolean {
    return !!value && value.length === length;
  }
}
