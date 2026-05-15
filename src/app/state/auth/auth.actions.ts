import { createAction, props } from '@ngrx/store';
import { User } from './auth.models';

export const login = createAction(
  '[Auth] Login',
  props<{ username: string; password: string; IsSupplierLogin?: boolean }>()
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
export const refreshAuthUser = createAction('[Auth] Refresh Auth User');
export const refreshAuthUserSuccess = createAction(
  '[Auth] Refresh Auth User Success',
  props<{ user: User }>()
);
export const refreshAuthUserFailure = createAction(
  '[Auth] Refresh Auth User Failure',
  props<{ error: any }>()
);


export const updateProfile = createAction(
  '[Auth] Update Profile',
  props<{ payload: any }>()
);

export const updateProfileSuccess = createAction(
  '[Auth] Update Profile Success',
  props<{ user: User }>()
);

export const updateProfileFailure = createAction(
  '[Auth] Update Profile Failure',
  props<{ error: any }>()
);

export const updateFirstLogin = createAction(
  '[Auth] Update First Login',
  props<{ isFirstLogin: boolean }>()
);

