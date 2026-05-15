import { Directive, HostListener, Input, Optional, Self } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appImageValidator]',
  standalone: true
  
})
export class ImageValidatorDirective {

  @Input({ required: true }) width!: number;
  @Input({ required: true }) height!: number;
  @Input() maxSizeMB = 2;

  constructor(
    @Self() @Optional() private readonly ngControl: NgControl
  ) {}

  @HostListener('change', ['$event'])
  onFileChange(event: Event): void {

    if (!this.ngControl?.control) {
      console.error('appImageValidator must be used with formControlName');
      return;
    }

    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    const control = this.ngControl.control;

    if (!file) {
      control.setErrors({ required: true });
      return;
    }

    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      this.invalidate(control, input, { invalidType: true });
      return;
    }

    if (file.size > this.maxSizeMB * 1024 * 1024) {
      this.invalidate(control, input, { maxSizeExceeded: true });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.src = reader.result as string;

      img.onload = () => {
        if (img.naturalWidth !== this.width || img.naturalHeight !== this.height) {
          this.invalidate(control, input, {
            invalidDimension: true
          });
          return;
        }


        control.setErrors(null);
        control.markAsTouched();
        control.updateValueAndValidity({ emitEvent: false });
      };
    };

    reader.readAsDataURL(file);
  }

  private invalidate(control: any, input: HTMLInputElement, error: any) {
    control.setErrors(error);
    control.markAsTouched();

    input.value = '';
  }
}
