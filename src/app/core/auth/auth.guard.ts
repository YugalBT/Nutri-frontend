// auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';

import { map, take } from 'rxjs/operators';
import { selectAuthUser } from '../../state/auth/auth.selectors';
import { loginSuccess, logout } from '../../state/auth/auth.actions';

export const authGuard: CanActivateFn = (route, state) => {
  const store = inject(Store);
  const router = inject(Router);

  return store.select(selectAuthUser).pipe(
    take(1),
    map((user) => {
      const token = sessionStorage.getItem('token');
      if (!user && token) {
        const storedUser = sessionStorage.getItem('user');
        if (storedUser) {
          store.dispatch(loginSuccess({ token, user: JSON.parse(storedUser) }));
          return true;
        } else {
          store.dispatch(logout());
          router.navigate(['/login']);
          return false;
        }
      }

      if (user) return true;

      store.dispatch(logout());
      router.navigate(['/login']);
      return false;
    })
  );
};
