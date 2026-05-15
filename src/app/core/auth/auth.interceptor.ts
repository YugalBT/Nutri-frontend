import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { TokenService } from '../../shared/services/token.service';
import { AuthService } from './auth.service';
import { ROUTE_CONST } from '../constants/route.constants';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);
  //const authService = inject(AuthService);
  const router = inject(Router);

  const token = tokenService.getToken();
  const language = localStorage.getItem('lang') || 'en';

  const headers: any = {
    'Accept-Language': language
  };
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
        ...headers
      }
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        //authService.logout();  
        const loginUrl = tokenService.getLoginPortalUrl();
        router.navigate([loginUrl]);
      }
      return throwError(() => error);
    })
  );
};
