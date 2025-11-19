
import { Validators } from '@angular/forms';

export const CustomValidators = {
  
  required: (message?: string) => Validators.required,
  email: () => Validators.email,
  password: () => Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/),
  minLength: (length: number) => Validators.minLength(length),
  maxLength: (length: number) => Validators.maxLength(length)
};