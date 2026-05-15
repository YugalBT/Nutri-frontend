// auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';

import { map, take } from 'rxjs/operators';
import { selectAuthUser } from '../../state/auth/auth.selectors';
import { loginSuccess, logout } from '../../state/auth/auth.actions';
import { TokenService } from '../../shared/services/token.service';

export const authGuard: CanActivateFn = (route, state) => {
  const store = inject(Store);
  const router = inject(Router);
  const tokenService = inject(TokenService);

  return store.select(selectAuthUser).pipe(
    take(1),
    map((user) => {
      const token = localStorage.getItem('token');
      if (!user && token) {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          store.dispatch(loginSuccess({ token, user: JSON.parse(storedUser) }));
          return true;
        } else {
          const loginUrl = tokenService.getLoginPortalUrl();
          store.dispatch(logout());
          router.navigate([loginUrl]);
          return false;
        }
      }

      if (user) return true;

      const loginUrl = tokenService.getLoginPortalUrl();
      store.dispatch(logout());
      router.navigate([loginUrl]);
      return false;
    })
  );
};
