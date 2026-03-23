import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { take, map, tap } from 'rxjs/operators';
import { ToastService } from '../../shared/services/toast.service';
import { selectUserRoles } from '../../state/auth/auth.selectors';
import { PERMISSIONS } from '../constants/permissions.constants';


export const permissionGuard: CanActivateFn = (route, state) => {
  const store = inject(Store);
  const router = inject(Router);
  const toast = inject(ToastService);

  const requiredPermissions: string[] = route.data?.['requiredPermissions'] || [];
  console.log("requiredPermissions",requiredPermissions);
  return store.select(selectUserRoles).pipe(
    take(1),
    map((roles: string[]) => {
  console.log("selectUserRoles",roles);
      return requiredPermissions.some(p => roles.includes(p));
    }),
    tap((allowed) => {
      if (!allowed) {
        toast.error('You do not have permission to access this page.');
        router.navigate(['/dashboard'], { replaceUrl: true });
      }
    })
  );
};
