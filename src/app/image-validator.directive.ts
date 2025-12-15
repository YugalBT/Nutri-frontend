import { Directive, HostListener, Input, inject } from '@angular/core';
import { FormGroupDirective } from '@angular/forms';

@Directive({
  selector: '[appImageValidator]',
  standalone: true
})
export class ImageValidatorDirective {

  @Input({ required: true }) controlName!: string;
  @Input({ required: true }) width!: number;
  @Input({ required: true }) height!: number;
  @Input() maxSizeMB: number = 2;

  private formGroupDir = inject(FormGroupDirective);

  @HostListener('change', ['$event'])
  onFileChange(event: Event): void {

    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const control = this.formGroupDir.form.get(this.controlName);

    if (!control) return;

    // 🔄 Reset previous errors
    control.setErrors(null);

    // ✅ File type validation
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      control.setErrors({ invalidType: true });
      control.markAsTouched();
      input.value = '';
      return;
    }

    // ✅ File size validation
    if (file.size > this.maxSizeMB * 1024 * 1024) {
      control.setErrors({ maxSizeExceeded: true });
      control.markAsTouched();
      input.value = '';
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const img = new Image();
      img.src = reader.result as string;

      img.onload = () => {
        const actualWidth = img.naturalWidth;
        const actualHeight = img.naturalHeight;

        // ✅ Dimension validation (REAL pixels)
        if (actualWidth !== this.width || actualHeight !== this.height) {
          control.setErrors({
            invalidDimension: {
              requiredWidth: this.width,
              requiredHeight: this.height,
              actualWidth,
              actualHeight
            }
          });
          control.markAsTouched();
          input.value = '';
          return;
        }

        // ✅ VALID IMAGE
        control.setValue(reader.result);
        control.markAsTouched();
        control.updateValueAndValidity();
      };
    };

    reader.readAsDataURL(file);
  }
}
