import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../auth/auth.service';

export const companyGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const companyCode = route.params['companyCode'];
  if (!companyCode) {
    router.navigate(['/404']);
    return false;
  }

  authService.getHomePageContent(companyCode).subscribe({
    next: res => {
      if (res?.isSuccess && res.data) {
        document.documentElement.style.setProperty('--primaryColor', res.data.primaryColor);
        document.documentElement.style.setProperty('--secondaryColor', res.data.secondaryColor);
      }
    },
    error: () => {
      router.navigate(['/404']);
    }
  });

  return true;
};
