import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { take, map, tap, combineLatest } from 'rxjs';
import { ToastService } from '../../shared/services/toast.service';
import { selectUserRoles, selectUserRoleType } from '../../state/auth/auth.selectors';
import { PERMISSIONS } from '../constants/permissions.constants';


export const permissionGuard: CanActivateFn = (route, state) => {
  const store = inject(Store);
  const router = inject(Router);
  const toast = inject(ToastService);

  const requiredPermissions: string[] = route.data?.['requiredPermissions'] || [];
  const requiredRoleTypes: string[] = (route.data?.['requiredRoleTypes'] || []).map(
    (r: string) => r.toUpperCase()
  );

  return combineLatest([
    store.select(selectUserRoles),
    store.select(selectUserRoleType),
  ]).pipe(
    take(1),
    map(([roles, roleType]: [string[], string]) => {
      const hasPermission = requiredPermissions.length === 0 ||
        requiredPermissions.some(p => roles.includes(p));
      const hasRole = requiredRoleTypes.length === 0 ||
        requiredRoleTypes.includes(roleType);
      return hasPermission && hasRole;
    }),
    tap((allowed) => {
      if (!allowed) {
        toast.error('You do not have permission to access this page.');
        router.navigate(['/dashboard'], { replaceUrl: true });
      }
    })
  );
};
