import { Routes } from '@angular/router';

export const routes: Routes = [

  // ============================
  // NO-LAYOUT ROUTES (Login Page)
  // ============================
  {
    path: 'login',
    title: 'Login',
    loadComponent: () =>
      import('./features/auth/login/login.component')
        .then(m => m.LoginComponent)
  },
  {
    path: 'dashboard',
    title: 'Dashboard',
    loadComponent: () =>
      import('./layout/layout.component')
        .then(m => m.LayoutComponent)
  },

//   // ============================
//   // LAYOUT ROUTES
//   // ============================
//   {
//     path: '',
//     loadComponent: () =>
//       import('./layout/layout.component')
//         .then(m => m.LayoutComponent),

//     children: [
//       {
//         path: 'dashboard',
//         title: 'Dashboard',
//         loadComponent: () =>
//           import('./features/dashboard/dashboard.component')
//             .then(m => m.DashboardComponent)
//       },

     
//     ]
//   },

  // ============================
  // DEFAULT REDIRECT
  // ============================
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },

  // ============================
  // 404 PAGE
  // ============================
//   {
//     path: '**',
//     loadComponent: () =>
//       import('./shared/not-found/not-found.component')
//         .then(m => m.NotFoundComponent)
//   }
];
