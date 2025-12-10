// permissions.constants.ts
export const PERMISSIONS = {
    UserView: 'UserView',
    UserEdit: 'UserEdit',
    UserAdd: 'UserAdd',
    UserDelete: 'UserDelete',

    RoleView: 'RoleView',
    RoleEdit: 'RoleEdit',
    RoleAdd: 'RoleAdd',
    RoleDelete: 'RoleDelete',

    Notificaton: 'Notificaton',

    ChangePasswordView: 'ChangePasswordView',
    ChangePasswordEdit: 'ChangePasswordEdit',

    ProfileView: 'ProfileView',
    ProfileEdit: 'ProfileEdit',

    SettingView: 'SettingView',
    SettingEdit: 'SettingEdit',

    FarmView: 'FarmView',
    FarmEdit: 'FarmEdit',
    FarmAdd: 'FarmAdd',
    FarmDelete: 'FarmDelete',

    FeedView: 'FeedView',
    FeedEdit: 'FeedEdit',
    FeedAdd: 'FeedAdd',
    FeedDelete: 'FeedDelete',

    RationView: 'RationView',
    RationEdit: 'RationEdit',
    RationAdd: 'RationAdd',
    RationDelete: 'RationDelete',

    ModuleView: 'ModuleView',
    ModuleEdit: 'ModuleEdit',
    ModuleAdd: 'ModuleAdd',
    ModuleDelete: 'ModuleDelete',

    ReportsView: 'ReportsView',
    ReportsEdit: 'ReportsEdit',
    ReportsAdd: 'ReportsAdd',
    ReportsDelete: 'ReportsDelete',

    DayView: 'DayView',
    DayEdit: 'DayEdit',
    DayAdd: 'DayAdd',
    DayDelete: 'DayDelete',

    CalvesRationView: 'CalvesRationView',
    CalvesRationEdit: 'CalvesRationEdit',
    CalvesRationAdd: 'CalvesRationAdd',
    CalvesRationDelete: 'CalvesRationDelete',

    TenantView: 'TenantView',
    TenantEdit: 'TenantEdit',
    TenantAdd: 'TenantAdd',
    TenantDelete: 'TenantDelete',
    
} as const;

export type PermissionKey = keyof typeof PERMISSIONS;
export type PermissionValue = typeof PERMISSIONS[PermissionKey];
