import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { finalize } from 'rxjs/operators';

export const spinnerInterceptor: HttpInterceptorFn = (req, next) => {
  const spinner = inject(NgxSpinnerService);

  try {
  } catch (e) {}

  spinner.show('primary');
  
  return next(req).pipe(
    finalize(() => {
      try {
      } catch (e) {}
      spinner.hide('primary');
    })
  );
};
