import { createReducer, on } from '@ngrx/store';
import * as AuthActions from './auth.actions';
import { AuthState, initialAuthState } from './auth.state';

export const authReducer = createReducer(
  initialAuthState,

  on(AuthActions.login, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(AuthActions.loginSuccess, (state, { user, token }) => ({
    ...state,
    user,
    token,
    loading: false,
    error: null
  })),

  on(AuthActions.loginFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  on(AuthActions.logout, (state) => ({
    ...state,
    user: null,
    token: null,
    loading: false,
    error: null
  })),

  on(AuthActions.refreshAuthUserSuccess, (state, { user }) => ({
  ...state,
  user,
  loading: false,
  error: null
})),

on(AuthActions.updateProfileSuccess, (state, { user }) => ({
  ...state,
  user,   
  loading: false,
  error: null,
})),

on(AuthActions.updateProfileFailure, (state, { error }) => ({
  ...state,
  loading: false,
  error,
}))

);
