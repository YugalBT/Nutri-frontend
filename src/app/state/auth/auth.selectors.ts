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

export const selectCanViewUsers = createSelector(
  selectUserRoles,
  (roles) => roles.includes('ViewUser')
);

export const selectCanEditUsers = createSelector(
  selectUserRoles,
  (roles) => roles.includes('EditUser')
);

export const selectCanDeleteUsers = createSelector(
  selectUserRoles,
  (roles) => roles.includes('DeleteUser')
);

export const selectCanAddUsers = createSelector(
  selectUserRoles,
  (roles) => roles.includes('AddUser')
);

export const selectCanViewRoles = createSelector(
  selectUserRoles,
  (roles) => roles.includes('ViewRole')
);

export const selectCanEditRoles = createSelector(
  selectUserRoles,
  (roles) => roles.includes('EditRole')
);

export const selectCanDeleteRoles = createSelector(
  selectUserRoles,
  (roles) => roles.includes('DeleteRole')
);

export const selectCanAddRoles = createSelector(
  selectUserRoles,
  (roles) => roles.includes('AddRole')
);

export const selectCanManageRoles = createSelector(
  selectUserRoles,
  (roles) => roles.includes('AddRole') || roles.includes('EditRole') || roles.includes('DeleteRole')
);

export const selectCanViewCompanies = createSelector(
  selectUserRoles,
  (roles) => roles.includes('ViewTenant')
);

export const selectCanEditCompanies = createSelector(
  selectUserRoles,
  (roles) => roles.includes('EditTenant')
);

export const selectCanAddCompanies = createSelector(
  selectUserRoles,
  (roles) => roles.includes('AddTenant')
);
