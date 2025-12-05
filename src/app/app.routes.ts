import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { companyGuard } from './core/auth/company.guard';

export const routes: Routes = [
  // Public Routes
  {
    path: ':companyCode/login',
    canActivate: [companyGuard],
    loadComponent: () =>
      import('./features/auth/login/login.component')
        .then(m => m.LoginComponent),
  },
  {
    path: 'forgot-password/:companyCode',
    loadComponent: () =>
      import('./features/auth/forgot-password/forgot-password.component')
        .then(m => m.ForgotPasswordComponent),
  },

  // Authenticated Area
  {
    path: '',
    loadComponent: () =>
      import('./layout/layout.component')
        .then(m => m.LayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component')
            .then(m => m.DashboardComponent),
      },
      {
        path: 'companies',
        loadComponent: () =>
          import('./features/company/company-list/company-list.component')
            .then(m => m.CompanyListComponent),
      },

      {
        path: 'users',
        loadComponent: () =>
          import('./features/users/list/list.component')
            .then(m => m.ListComponent),
      },

      {
        path: 'roles',
        loadComponent: () =>
          import('./features/role/role-list/role.component')
            .then(m => m.RoleComponent),
      },

      {
        path: 'notifications',
        loadComponent: () =>
          import('./features/notifications/notifications.component')
            .then(m => m.NotificationsComponent),
      },
      {
        path: 'change-password',
        loadComponent: () =>
          import('./features/auth/change-password/change-password.component')
            .then(m => m.ChangePasswordComponent),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/profile/profile.component')
            .then(m => m.ProfileComponent),
      },
      {
        path: 'setting',
        loadComponent: () =>
          import('./features/companysetting/companysetting.component')
            .then(m => m.CompanysettingComponent),
      },
      {
        path: 'farm',
        loadComponent: () =>
          import('./features/farm/farm-list/farm-list.component')
            .then(m => m.FarmListComponent),
      },
      {
        path: 'feed',
        loadComponent: () =>
          import('./features/feed/feed-list/feed-list.component')
            .then(m => m.FeedListComponent),
      },
      {
        path: 'ration',
        loadComponent: () =>
          import('./features/ration/ration-list/ration-list.component')
            .then(m => m.RationListComponent),
      },
      {
        path: 'module',
        loadComponent: () =>
          import('./features/module/module-list/module-list.component')
            .then(m => m.ModuleListComponent),
      },

      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },

  {
    path: '404',
    loadComponent: () =>
      import('./shared/not-found/not-found.component')
        .then(m => m.NotFoundComponent),
  },
  // {
  //   path: '**',
  //   redirectTo: '404',
  // },
];
