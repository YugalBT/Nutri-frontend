import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, take } from 'rxjs/operators';
import { selectIsFirstLogin } from '../../state/auth/auth.selectors';

export const firstLoginGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const store = inject(Store);

  const url = state?.url ?? '';

  return store.select(selectIsFirstLogin).pipe(
    take(1),
    map(isFirstLogin => {

      //  Must reset password
      if (isFirstLogin === false && !url.includes('reset-password')) {
        return router.createUrlTree(['/reset-password']);
      }

      //  Reset already done
      if (isFirstLogin === true && url.includes('reset-password')) {
        return router.createUrlTree(['/dashboard']);
      }

      return true;
    })
  );
};
