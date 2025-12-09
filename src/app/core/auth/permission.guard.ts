import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, take } from 'rxjs/operators';
import { selectUserRoles } from '../../state/auth/auth.selectors';

export const permissionGuard: CanActivateFn = (route, state) => {
  const store = inject(Store);
  const router = inject(Router);

  const requiredPerm = route.data['permission'] as string;
  return store.select(selectUserRoles).pipe(
    
    take(1),
    map(roles => {
      if (roles?.includes(requiredPerm)) {
        return true;
      } else {
        router.navigate(['/dashboard']);
        return false;
      }
    })
  );
};
