import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { permissionGuard } from './core/auth/permission.guard';
import { PERMISSIONS } from './core/constants/permissions.constants';
import { firstLoginGuard } from './core/auth/first-login.guard';

export const routes: Routes = [
  // ── Public Routes ──────────────────────────────────────────
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(
        (m) => m.LoginComponent,
      ),
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./features/auth/forgot-password/forgot-password.component').then(
        (m) => m.ForgotPasswordComponent,
      ),
  },
  {
    path: 'reset-password',
    canActivate: [authGuard, firstLoginGuard],
    loadComponent: () =>
      import('./features/auth/reset-password/reset-password.component').then(
        (m) => m.ResetPasswordComponent,
      ),
  },

  // ── Layout (authenticated) ─────────────────────────────────
  {
    path: '',
    loadComponent: () =>
      import('./layout/layout.component').then((m) => m.LayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        canActivate: [firstLoginGuard],
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent,
          ),
      },
      {
        path: 'companies',
        canActivate: [permissionGuard],
        data: {
          requiredPermissions: [
            PERMISSIONS.TenantView,
            PERMISSIONS.TenantEdit,
            PERMISSIONS.TenantAdd,
            PERMISSIONS.TenantDelete,
          ],
        },
        loadComponent: () =>
          import('./features/company/company-list/company-list.component').then(
            (m) => m.CompanyListComponent,
          ),
      },
      {
        path: 'users',
        canActivate: [permissionGuard],
        data: {
          requiredPermissions: [
            PERMISSIONS.UserView,
            PERMISSIONS.UserEdit,
            PERMISSIONS.UserAdd,
            PERMISSIONS.UserDelete,
          ],
        },
        loadComponent: () =>
          import('./features/users/list/list.component').then(
            (m) => m.ListComponent,
          ),
      },
      {
        path: 'roles',
        canActivate: [permissionGuard],
        data: {
          requiredPermissions: [
            PERMISSIONS.RoleView,
            PERMISSIONS.RoleEdit,
            PERMISSIONS.RoleAdd,
            PERMISSIONS.RoleDelete,
          ],
        },
        loadComponent: () =>
          import('./features/role/role-list/role.component').then(
            (m) => m.RoleComponent,
          ),
      },
      {
        path: 'notifications',
        canActivate: [permissionGuard],
        data: { requiredPermissions: [PERMISSIONS.Notificaton] },
        loadComponent: () =>
          import('./features/notifications/notifications.component').then(
            (m) => m.NotificationsComponent,
          ),
      },
      {
        path: 'change-password',
        canActivate: [permissionGuard],
        data: {
          requiredPermissions: [
            PERMISSIONS.ChangePasswordView,
            PERMISSIONS.ChangePasswordEdit,
          ],
        },
        loadComponent: () =>
          import('./features/auth/change-password/change-password.component').then(
            (m) => m.ChangePasswordComponent,
          ),
      },
      {
        path: 'profile',
        canActivate: [permissionGuard],
        data: {
          requiredPermissions: [
            PERMISSIONS.ProfileView,
            PERMISSIONS.ProfileEdit,
          ],
        },
        loadComponent: () =>
          import('./features/profile/profile.component').then(
            (m) => m.ProfileComponent,
          ),
      },
      {
        path: 'setting',
        canActivate: [permissionGuard],
        data: {
          requiredPermissions: [
            PERMISSIONS.SettingView,
            PERMISSIONS.SettingEdit,
          ],
        },
        loadComponent: () =>
          import('./features/companysetting/companysetting.component').then(
            (m) => m.CompanysettingComponent,
          ),
      },
      {
        path: 'farm',
        canActivate: [permissionGuard],
        data: {
          requiredPermissions: [
            PERMISSIONS.FarmView,
            PERMISSIONS.FarmEdit,
            PERMISSIONS.FarmAdd,
            PERMISSIONS.FarmDelete,
          ],
        },
        loadComponent: () =>
          import('./features/farm/farm-list/farm-list.component').then(
            (m) => m.FarmListComponent,
          ),
      },
      {
        path: 'feed',
        canActivate: [permissionGuard],
        data: {
          requiredPermissions: [
            PERMISSIONS.FeedView,
            PERMISSIONS.FeedEdit,
            PERMISSIONS.FeedAdd,
            PERMISSIONS.FeedDelete,
          ],
        },
        loadComponent: () =>
          import('./features/feed/feed-list/feed-list.component').then(
            (m) => m.FeedListComponent,
          ),
      },
      {
        path: 'ration',
        canActivate: [permissionGuard],
        data: {
          requiredPermissions: [
            PERMISSIONS.RationView,
            PERMISSIONS.RationEdit,
            PERMISSIONS.RationAdd,
            PERMISSIONS.RationDelete,
          ],
        },
        loadComponent: () =>
          import('./features/ration/ration-list/ration-list.component').then(
            (m) => m.RationListComponent,
          ),
      },
      {
        path: 'ration/items',
        canActivate: [permissionGuard],
        data: {
          requiredPermissions: [PERMISSIONS.RationView],
        },
        loadComponent: () =>
          import('./features/ration/ration-items/ration-items.component').then(
            (m) => m.RationItemsComponent,
          ),
      },
      {
        path: 'module',
        canActivate: [permissionGuard],
        data: {
          requiredPermissions: [
            PERMISSIONS.ModuleView,
            PERMISSIONS.ModuleEdit,
            PERMISSIONS.ModuleAdd,
            PERMISSIONS.ModuleDelete,
          ],
        },
        loadComponent: () =>
          import('./features/module/module-list/module-list.component').then(
            (m) => m.ModuleListComponent,
          ),
      },
      {
        path: 'reports',
        loadComponent: () =>
          import('./features/reports/reports/reports.component').then(
            (m) => m.ReportsComponent,
          ),
      },
      {
        path: 'kpi',
        canActivate: [permissionGuard],
        data: {
          requiredPermissions: [
            PERMISSIONS.KpiView,
            PERMISSIONS.KpiEdit,
            PERMISSIONS.KpiAdd,
            PERMISSIONS.KpiDelete,
          ],
        },
        loadComponent: () =>
          import('./features/day/kpi-list/kpi-list.component').then(
            (m) => m.KpiListComponent,
          ),
      },
      {
        path: 'animalType',
        canActivate: [permissionGuard],
        data: {
          requiredPermissions: [
            PERMISSIONS.AnimalTypeAdd,
            PERMISSIONS.AnimalTypeEdit,
            PERMISSIONS.AnimalTypeView,
            PERMISSIONS.AnimalTypeDelete,
          ],
        },
        loadComponent: () =>
          import('./features/animalType/animal-type-list/animal-type-list.component').then(
            (m) => m.AnimalTypeListComponent,
          ),
      },
      {
        path: 'animalLactationStage',
        canActivate: [permissionGuard],
        data: {
          requiredPermissions: [
            PERMISSIONS.AnimalLactationAdd,
            PERMISSIONS.AnimalLactationEdit,
            PERMISSIONS.AnimalLactationView,
            PERMISSIONS.AnimalLactationDelete,
          ],
        },
        loadComponent: () =>
          import('./features/animalLactation/animal-lactation-list/animal-lactation-list.component').then(
            (m) => m.AnimalLactationListComponent,
          ),
      },
      // ── NEW NUTRI FARM MODULE ROUTES ────────────────────────
      {
        path: 'daily-entry',
        canActivate: [permissionGuard],
        data: {
          requiredPermissions: [
            PERMISSIONS.DailyEntryView,
            PERMISSIONS.DailyEntryAdd,
            PERMISSIONS.DailyEntryEdit,
            PERMISSIONS.DailyEntryDelete,
          ],
        },
        loadComponent: () =>
          import('./features/daily-entry/daily-entry.component').then(
            (m) => m.DailyEntryComponent,
          ),
      },
      {
        path: 'archive',
        canActivate: [permissionGuard],
        data: {
          requiredPermissions: [
            PERMISSIONS.ArchiveView,
            PERMISSIONS.ArchiveAdd,
            PERMISSIONS.ArchiveEdit,
            PERMISSIONS.ArchiveDelete,
          ],
        },
        loadComponent: () =>
          import('./features/archive/archive.component').then(
            (m) => m.ArchiveComponent,
          ),
      },
      {
        path: 'parti',
        canActivate: [permissionGuard],
        data: {
          requiredPermissions: [
            PERMISSIONS.PartiView,
            PERMISSIONS.PartiAdd,
            PERMISSIONS.PartiEdit,
            PERMISSIONS.PartiDelete,
          ],
        },
        loadComponent: () =>
          import('./features/parti/parti-list.component').then(
            (m) => m.PartiListComponent,
          ),
      },
      {
        path: 'sanita',
        canActivate: [permissionGuard],
        data: {
          requiredPermissions: [
            PERMISSIONS.SanitaView,
            PERMISSIONS.SanitaAdd,
            PERMISSIONS.SanitaEdit,
            PERMISSIONS.SanitaDelete,
          ],
        },
        loadComponent: () =>
          import('./features/sanita/sanita-list.component').then(
            (m) => m.SanitaListComponent,
          ),
      },
      {
        path: 'fertilita',
        canActivate: [permissionGuard],
        data: {
          requiredPermissions: [
            PERMISSIONS.FertilitaView,
            PERMISSIONS.FertilitaAdd,
            PERMISSIONS.FertilitaEdit,
            PERMISSIONS.FertilitaDelete,
          ],
        },
        loadComponent: () =>
          import('./features/fertilita/fertilita-list.component').then(
            (m) => m.FertilitaListComponent,
          ),
      },
      {
        path: 'milk-price-history',
        canActivate: [permissionGuard],
        data: {
          requiredPermissions: [
            PERMISSIONS.MilkPriceHistoryView,
            PERMISSIONS.MilkPriceHistoryAdd,
            PERMISSIONS.MilkPriceHistoryEdit,
            PERMISSIONS.MilkPriceHistoryDelete,
          ],
        },
        loadComponent: () =>
          import('./features/milk-price-history/milk-price-history.component').then(
            (m) => m.MilkPriceHistoryComponent,
          ),
      },
      {
        path: 'animalGroup',
        canActivate: [permissionGuard],
        data: {
          requiredPermissions: [
            PERMISSIONS.AnimalGroupAdd,
            PERMISSIONS.AnimalGroupEdit,
            PERMISSIONS.AnimalGroupView,
            PERMISSIONS.AnimalGroupDelete,
          ],
        },
        loadComponent: () =>
          import('./features/animal-group/animal-group-list/animal-group-list.component').then(
            (m) => m.AnimalGroupListComponent,
          ),
      },
      {
        path: 'configuration',
        canActivate: [permissionGuard],
        data: {
          requiredPermissions: [
            PERMISSIONS.EmailConfigurationAdd,
            PERMISSIONS.EmailConfigurationEdit,
            PERMISSIONS.EmailConfigurationView,
            PERMISSIONS.EmailConfigurationDelete,
          ],
        },
        loadComponent: () =>
          import('./features/configuration/configuration.component').then(
            (m) => m.ConfigurationComponent,
          ),
      },
      {
        path: 'template',
        loadComponent: () =>
          import('./features/template-builder/template-builder.component').then(
            (m) => m.TemplateBuilderComponent,
          ),
      },
      {
        path: 'operators',
        loadComponent: () =>
          import('./features/operators/operator-list/operator-list.component').then(
            (m) => m.OperatorListComponent,
          ),
      },
      {
        path: 'formulas',
        canActivate: [permissionGuard],
        data: {
          requiredPermissions: [
            PERMISSIONS.FormulaAdd,
            PERMISSIONS.formulasEdit,
            PERMISSIONS.formulasView,
            PERMISSIONS.formulasDelete,
          ],
        },
        loadComponent: () =>
          import('./features/expression/expression-list/expression-list.component').then(
            (m) => m.ExpressionListComponent,
          ),
      },
      {
        path: 'technicalReport',
        loadComponent: () =>
          import('./features/technicalReport/technical-report-list/technical-report-list.component').then(
            (m) => m.TechnicalReportListComponent,
          ),
      },
      {
        path: 'language',
        loadComponent: () =>
          import('./features/language/language-list/language-list.component').then(
            (m) => m.LanguageListComponent,
          ),
      },
      {
        path: 'economic-report',
        loadComponent: () =>
          import('./features/economic-report/economic-report-list/economic-report-list.component').then(
            (m) => m.EconomicReportListComponent,
          ),
      },
      {
        path: 'nutrition',
        loadComponent: () =>
          import('./features/nutrition/nutrition/nutrition.component').then(
            (m) => m.NutritionComponent,
          ),
      },
      {
        path: 'suppliers',
        canActivate: [permissionGuard],
        data: {
          requiredPermissions: [
            PERMISSIONS.SuppliersAdd,
            PERMISSIONS.SuppliersEdit,
            PERMISSIONS.SuppliersView,
            PERMISSIONS.SuppliersDelete,
          ],
        },
        loadComponent: () =>
          import('./features/supplier/supplier-list/supplier-list.component').then(
            (m) => m.SupplierListComponent,
          ),
      },
      {
        path: 'materials',
        canActivate: [permissionGuard],
        data: {
          requiredPermissions: [
            PERMISSIONS.MaterialsAdd,
            PERMISSIONS.MaterialsEdit,
            PERMISSIONS.MaterialsView,
            PERMISSIONS.MaterialsDelete,
          ],
        },
        loadComponent: () =>
          import('./features/materials/material-list/material-list.component').then(
            (m) => m.MaterialListComponent,
          ),
      },
      {
        path: 'supplier-price',
        canActivate: [permissionGuard],
        data: {
          requiredPermissions: [
            PERMISSIONS.SupplierPriceAdd,
            PERMISSIONS.SupplierPriceEdit,
            PERMISSIONS.SupplierPriceView,
            PERMISSIONS.SupplierPriceDelete,
          ],
        },
        loadComponent: () =>
          import('./features/supplier-price/supplier-price-list/supplier-price-list.component').then(
            (m) => m.SupplierPriceListComponent,
          ),
      },
      {
        path: 'supplier-pricing-formula',
        loadComponent: () =>
          import('./features/supplier-pricing-formula/supplier-pricing-formula-list/supplier-pricing-formula-list.component').then(
            (m) => m.SupplierPricingFormulaListComponent,
          ),
      },
      {
        path: 'calfbarn',
        loadComponent: () =>
          import('./features/calfbarn/calfbarn-list/calfbarn-list.component').then(
            (m) => m.CalfbarnListComponent,
          ),
      },
      {
        path: 'pricingSetting',
        loadComponent: () =>
          import('./features/supplier-pricing-setting/supplier-pricing-setting/supplier-pricing-setting.component').then(
            (m) => m.SupplierPricingSettingComponent,
          ),
      },
      {
        path: 'product',
        loadComponent: () =>
          import('./features/product/product-list/product-list.component').then(
            (m) => m.ProductListComponent,
          ),
      },
      {
        path: 'productpricing',
        loadComponent: () =>
          import('./features/product-price/product-price-list/product-price-list.component').then(
            (m) => m.ProductPriceListComponent,
          ),
      },
      {
        path: 'productbuild',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/product-build/product-build-list/product-build-list.component').then(
                (m) => m.ProductBuildListComponent,
              ),
          },
          {
            path: ':id/detail',
            loadComponent: () =>
              import('./features/product-build/product-build-detail/product-build-detail.component').then(
                (m) => m.ProductBuildDetailComponent,
              ),
          },
        ],
      },

      
      // ────────────────────────────────────────────────────────

      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },

  {
    path: '404',
    loadComponent: () =>
      import('./shared/not-found/not-found.component').then(
        (m) => m.NotFoundComponent,
      ),
  },
  { path: '**', redirectTo: '404' },
];