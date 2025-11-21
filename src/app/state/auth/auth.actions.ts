import { createAction, props } from '@ngrx/store';
import { User } from './auth.models';


export const login = createAction(
  '[Auth] Login',
  props<{ username: string; password: string; companyCode?: string }>()
);

export const loginSuccess = createAction(
  '[Auth] Login Success',
  props<{ user: User; token: string; silent?: boolean }>()
);

export const loginFailure = createAction(
  '[Auth] Login Failure',
  props<{ error: string }>()
);

export const logout = createAction('[Auth] Logout');
