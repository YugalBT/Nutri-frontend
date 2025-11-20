import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component')
        .then(m => m.LoginComponent)
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./features/auth/forgot-password/forgot-password.component')
        .then(m => m.ForgotPasswordComponent)
  },
  {
    path: '',
    loadComponent: () =>
      import('./layout/layout.component').then(m => m.LayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component')
            .then(m => m.DashboardComponent),
        canActivate: [authGuard]
      },
      {
        path: 'user',
        loadComponent: () =>
          import('./features/users/users.component')
            .then(m => m.UsersComponent),
        canActivate: [authGuard]
      },
      {
        path: 'company',
        loadComponent: () =>
          import('./features/company/company.component')
            .then(m => m.CompanyComponent),
        canActivate: [authGuard]
      },
      {
        path: 'role',
        loadComponent: () =>
          import('./features/role/role.component')
            .then(m => m.RoleComponent),
        canActivate: [authGuard]
      },
      {
        path: 'notifications',
        loadComponent: () =>
          import('./features/notifications/notifications.component')
            .then(m => m.NotificationsComponent),
        canActivate: [authGuard]
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/profile/profile.component')
            .then(m => m.ProfileComponent),
        canActivate: [authGuard]
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' } 
    ]
  },
  {
    path: '**',
    loadComponent: () =>
      import('./shared/not-found/not-found.component').then(m => m.NotFoundComponent)
  }
];
