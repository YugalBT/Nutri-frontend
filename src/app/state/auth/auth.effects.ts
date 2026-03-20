import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Router } from '@angular/router';
import { of, from } from 'rxjs';
import { catchError, map, switchMap, tap, finalize } from 'rxjs/operators';
import { NgxSpinnerService } from 'ngx-spinner';

import * as AuthActions from './auth.actions';
import { AuthService } from '../../core/auth/auth.service';
import { TokenService } from '../../shared/services/token.service';
import { LoginRequest } from '../../core/models/login-request';
import { ToastService } from '../../shared/services/toast.service';
import { UpdateProfileService } from '../../core/services/profile/update-profile.service';
import { ROUTE_CONST } from '../../core/constants/route.constants';
import { use } from 'echarts';
import { TranslatePipe } from '../../i18n/translate.pipe';
import { TranslateService } from '../../i18n/translate.service';

@Injectable()

export class AuthEffects {

  login$;
  loginSuccess$;
  logout$;
  loginFailure$;
  updateProfile$;
  refreshAuthUser$;
  updateProfileSuccess$;

  constructor(
    private actions$: Actions,
    private authService: AuthService,
    private router: Router,
    private tokenService: TokenService,
    private toast: ToastService,
    private spinner: NgxSpinnerService,
    private updateProfileService: UpdateProfileService,
    private translate: TranslateService

  ) {
    this.login$ = createEffect(() =>
      this.actions$.pipe(
        ofType(AuthActions.login),
        switchMap(({ username, password}) => {
          const payload: LoginRequest = {
            username,
            password
          };

          return this.authService.login(payload).pipe(
            map((res) => {
              if (!res?.isSuccess || !res?.data?.token) {
                return AuthActions.loginFailure({
                  error: res?.message,
                });
              }

              return AuthActions.loginSuccess({
                user: res?.data,
                token: res?.data?.token,
              });
            }),
            catchError((error) =>
              of(
                AuthActions.loginFailure({
                  error: error?.message,
                })
              )
            )
          );
        })
      )
    );

    this.loginSuccess$ = createEffect(
      () =>
        this.actions$.pipe(
          ofType(AuthActions.loginSuccess),
          tap(({ user, token, silent }) => {
            this.tokenService.setToken(token);
            this.tokenService.setUserData(JSON.stringify(user));
            this.tokenService.setUserName(user?.username ?? '');
            this.tokenService.setIsSuperAdmin(user?.isSuperAdmin ?? false);
        if (user?.supplierDetails) {
          this.tokenService.setSupplierData(user.supplierDetails);
        } else {
          this.tokenService.removeSupplierData();
        }

            try {
              if (typeof document !== 'undefined' && user) {
                const root = document.documentElement;
                if (user?.primaryColor) {
                  root.style.setProperty('--primary-color', user.primaryColor);
                }
                if (user?.secondaryColor) {
                  root.style.setProperty('--secondary-color', user.secondaryColor);
                }
              }
            } catch (e) {
            }

            if (!silent) {
              // use translate pipe 

              const successMessage = this.translate.instant('auth.LOGIN_SUCCESS')??"";

              this.toast.success(successMessage);
              if(!user?.isFirstLogin) {
                this.router.navigate([ROUTE_CONST.RESET_PASSWORD]);
                return;
              }
              this.router.navigate([ROUTE_CONST.DASHBOARD]);
            }
          })
        ),
      { dispatch: false }
    );

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


    this.logout$ = createEffect(
      () =>
        this.actions$.pipe(
          ofType(AuthActions.logout),
          switchMap(() => {
            this.spinner.show();
            this.tokenService.clearAll();

            return from(this.router.navigate([ROUTE_CONST.LOGIN])).pipe(
              finalize(() => {
                this.spinner.hide();
              })
            );
          })
        ),
      { dispatch: false }
    );


    this.updateProfile$ = createEffect(() =>
      this.actions$.pipe(
        ofType(AuthActions.updateProfile),
        switchMap(({ payload }) =>
          this.updateProfileService.updateProfile(payload).pipe(
            map((res) => {
              if (res?.isSuccess) {
                return AuthActions.updateProfileSuccess({ user: res?.data });
              }
              return AuthActions.updateProfileFailure({ error: res?.message });
            }),
            catchError((err) => of(AuthActions.updateProfileFailure({ error: err })))
          )
        )
      )
    );


    this.updateProfileSuccess$ = createEffect(
      () =>
        this.actions$.pipe(
          ofType(AuthActions.updateProfileSuccess),
          tap(({ user }) => {
            this.tokenService.setUserData(JSON.stringify(user));
            this.toast.success('Profile updated successfully!');
          })
        ),
      { dispatch: false }
    );

    this.refreshAuthUser$ = createEffect(() =>
      this.actions$.pipe(
        ofType(AuthActions.refreshAuthUser),
        map(() => {
          try {
            const raw = this.tokenService.getUserData();
            if (!raw) {
              return AuthActions.refreshAuthUserFailure({ error: 'No user data available' });
            }
            const user = JSON.parse(raw);
            return AuthActions.refreshAuthUserSuccess({ user });
          } catch (e) {
            return AuthActions.refreshAuthUserFailure({ error: e });
          }
        })
      )
    );

  }

}
