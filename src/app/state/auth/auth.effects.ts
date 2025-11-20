import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as AuthActions from './auth.actions';
import { AuthService } from '../../core/auth/auth.service';
import { Router } from '@angular/router';
import { catchError, map, mergeMap, of, tap } from 'rxjs';
import { LoginRequest } from '../../core/models/login-request';
import { TokenService } from '../../shared/services/token.service';

@Injectable()
export class AuthEffects {
  constructor(
    private actions$: Actions,
    private authService: AuthService,
    private router: Router,
    private tokenService: TokenService
  ) {}

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      mergeMap(({ username, password, companyCode }) => {
        const payload: LoginRequest = { username, password, companyCode: companyCode ?? 'set' };
        return this.authService.login(payload).pipe(
          map((res: any) => {
            if (!res?.isSuccess || !res?.data?.token) {
              return AuthActions.loginFailure({ error: res?.message || 'API error' });
            }
            const user = res.data;
            const token = res.data.token;
            return AuthActions.loginSuccess({ user, token });
          }),
          catchError((err) =>
            of(AuthActions.loginFailure({ error: err?.message || 'Something went wrong' }))
          )
        );
      })
    )
  );

  loginSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginSuccess),
        tap(({ user, token }) => {
          // Save token & user info
          this.tokenService.setToken(token);
          this.tokenService.setUserData(JSON.stringify(user));
          this.tokenService.setUserName(user.username);
          // Navigate
          this.router.navigate(['/dashboard']);
        })
      ),
    { dispatch: false }
  );

  logout$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.logout),
        tap(() => {
          this.tokenService.removeToken();
          this.tokenService.removeUserData();
          this.tokenService.removeUserUserName();
          this.router.navigate(['/login']);
        })
      ),
    { dispatch: false }
  );
}
