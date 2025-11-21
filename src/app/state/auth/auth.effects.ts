import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Router } from '@angular/router';
import { catchError, map, of, switchMap, tap } from 'rxjs';

import * as AuthActions from './auth.actions';
import { AuthService } from '../../core/auth/auth.service';
import { TokenService } from '../../shared/services/token.service';
import { LoginRequest } from '../../core/models/login-request';
import { ToastService } from '../../shared/services/toast.service';

@Injectable()

export class AuthEffects {
  /**
   * LOGIN EFFECT
   * - Uses switchMap to avoid concurrent login calls
   * - Handles API validation more cleanly
   */
  // Effects will be created in the constructor so injected deps are available
  login$;
  loginSuccess$;
  logout$;
  loginFailure$;

  constructor(
    private actions$: Actions,
    private authService: AuthService,
    private router: Router,
    private tokenService: TokenService,
    private toast: ToastService
  ) {
    // LOGIN EFFECT
    this.login$ = createEffect(() =>
      this.actions$.pipe(
        ofType(AuthActions.login),
        switchMap(({ username, password, companyCode }) => {
          const payload: LoginRequest = {
            username,
            password,
            companyCode: companyCode ?? 'set',
          };

          return this.authService.login(payload).pipe(
            map((res) => {
              if (!res?.isSuccess || !res?.data?.token) {
                return AuthActions.loginFailure({
                  error: res?.message || 'Invalid credentials',
                });
              }

              return AuthActions.loginSuccess({
                user: res.data,
                token: res.data.token,
              });
            }),
            catchError((error) =>
              of(
                AuthActions.loginFailure({
                  error: error?.message || 'Login request failed',
                })
              )
            )
          );
        })
      )
    );

    // LOGIN SUCCESS → Save token + user → Navigate
    this.loginSuccess$ = createEffect(
      () =>
        this.actions$.pipe(
          ofType(AuthActions.loginSuccess),
          tap(({ user, token, silent }) => {
            // Always persist token and user data, but only show toast / navigate
            // when this is a real login (not a silent restore on app init).
            this.tokenService.setToken(token);
            this.tokenService.setUserData(JSON.stringify(user)); // store object directly
            this.tokenService.setUserName(user?.username ?? '');

            if (!silent) {
              this.toast.success('Login successful!');
              this.router.navigate(['/dashboard']);
            }
          })
        ),
      { dispatch: false }
    );

    // LOGIN SUCCESS → Save token + user → Navigate
    this.loginFailure$ = createEffect(
      () =>
        this.actions$.pipe(
          ofType(AuthActions.loginFailure),
          tap(({ error }) => {
            this.toast.error('Login failed: ' + error);
          }
          )),
      { dispatch: false }
    );


    // LOGOUT EFFECT
    this.logout$ = createEffect(
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

}
