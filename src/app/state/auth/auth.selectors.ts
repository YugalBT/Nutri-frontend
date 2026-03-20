import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState } from './auth.state';


export const selectAuthState = createFeatureSelector<AuthState>('auth');

export const selectAuthUser = createSelector(selectAuthState, (state) => state.user);
export const selectToken = createSelector(selectAuthState, (state) => state.token);
export const selectAuthLoading = createSelector(selectAuthState, (state) => state.loading);
export const selectAuthError = createSelector(selectAuthState, (state) => state.error);


export const selectUserRoles = createSelector(
  selectAuthUser,
  (user) => user?.roles || []
);

export const selectUserPermissions = createSelector(
  selectAuthUser,
  (user) => user?.permissions || []
);

export const selectIsFirstLogin = createSelector(
  selectAuthUser,
  (user) => user?.isFirstLogin
);
export const selectSupplier = createSelector(
  selectAuthState,
  (state) => state?.supplier
);

