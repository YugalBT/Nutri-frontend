import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  // Public Routes
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component')
        .then(m => m.LoginComponent),
  },
  {
    path: 'forgot-password',
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
        path: 'company',
        loadComponent: () =>
          import('./features/company/company-list/company-list.component')
            .then(m => m.CompanyListComponent),
      },

      {
        path: 'user',
        loadComponent: () =>
          import('./features/users/list/list.component')
            .then(m => m.ListComponent),
      },
     
      {
        path: 'role',
        loadComponent: () =>
          import('./features/role/role.component')
            .then(m => m.RoleComponent),
      },
      
      {
        path: 'notifications',
        loadComponent: () =>
          import('./features/notifications/notifications.component')
            .then(m => m.NotificationsComponent),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/profile/profile.component')
            .then(m => m.ProfileComponent),
      },

      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },

  // Catch-all must be last
  {
    path: '**',
    loadComponent: () =>
      import('./shared/not-found/not-found.component')
        .then(m => m.NotFoundComponent),
  },
];
