import { AbstractControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';

export const CustomValidators = {

  required: (message?: string): ValidatorFn => {
    return (control: AbstractControl): ValidationErrors | null => {
      return Validators.required(control);
    };
  },

  email: (): ValidatorFn => Validators.email,

  password: (): ValidatorFn => Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/),

  minLength: (length: number): ValidatorFn => Validators.minLength(length),

  maxLength: (length: number): ValidatorFn => Validators.maxLength(length),

  onlyChars: (): ValidatorFn => {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const valid = /^[a-zA-Z\s]+$/.test(control.value);
      return valid ? null : { onlyChars: true };
    };
  },

  onlyNumbers: (): ValidatorFn => {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const valid = /^[0-9]+$/.test(control.value);
      return valid ? null : { onlyNumbers: true };
    };
  },

  alphaNumeric: (): ValidatorFn => {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const valid = /^[a-zA-Z0-9]+$/.test(control.value);
      return valid ? null : { alphaNumeric: true };
    };
  },

  pattern: (regex: RegExp, errorKey = 'pattern'): ValidatorFn => {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const valid = regex.test(control.value);
      return valid ? null : { [errorKey]: true };
    };
  }

};
