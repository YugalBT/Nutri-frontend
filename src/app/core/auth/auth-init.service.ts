import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { TokenService } from '../../shared/services/token.service';
import * as AuthActions from '../../state/auth/auth.actions';

@Injectable({ providedIn: 'root' })
export class AuthInitService {
  constructor(
    private tokenService: TokenService,
    private store: Store
  ) {}

  initializeAuthState() {
    const token = this.tokenService.getToken();
    const userData = this.tokenService.getUserData();

    if (token && userData) {
      if (this.tokenService.isTokenExpired()) {
        this.tokenService.clearAll();
        this.store.dispatch(AuthActions.logout());
        return;
      }

      this.store.dispatch(AuthActions.loginSuccess({
        token,
        user: JSON.parse(userData),
        silent: true
      }));
      return;
    }
    this.store.dispatch(AuthActions.logout());
  }
}
