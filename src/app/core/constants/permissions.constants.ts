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

  EmailConfigurationView: 'EmailConfigurationView',
  EmailConfigurationEdit: 'EmailConfigurationEdit',
  EmailConfigurationAdd: 'EmailConfigurationAdd',
  EmailConfigurationDelete: 'EmailConfigurationDelete',

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

  KpiView: 'KpiView',
  KpiEdit: 'KpiEdit',
  KpiAdd: 'KpiAdd',
  KpiDelete: 'KpiDelete',

  CalvesRationView: 'CalvesRationView',
  CalvesRationEdit: 'CalvesRationEdit',
  CalvesRationAdd: 'CalvesRationAdd',
  CalvesRationDelete: 'CalvesRationDelete',

  TenantView: 'TenantView',
  TenantEdit: 'TenantEdit',
  TenantAdd: 'TenantAdd',
  TenantDelete: 'TenantDelete',

  AnimalTypeView: 'AnimalTypeView',
  AnimalTypeEdit: 'AnimalTypeEdit',
  AnimalTypeDelete: 'AnimalTypeDelete',
  AnimalTypeAdd: 'AnimalTypeAdd',

  AnimalLactationAdd: 'AnimalLactationAdd',
  AnimalLactationEdit: 'AnimalLactationEdit',
  AnimalLactationDelete: 'AnimalLactationDelete',
  AnimalLactationView: 'AnimalLactationView',

  AnimalGroupAdd: 'AnimalGroupAdd',
  AnimalGroupEdit: 'AnimalGroupEdit',
  AnimalGroupDelete: 'AnimalGroupDelete',
  AnimalGroupView: 'AnimalGroupView',

  FormulaAdd: 'formulasAdd',
  formulasEdit: 'formulasEdit',
  formulasDelete: 'formulasDelete',
  formulasView: 'formulasView',

  PlaceholderView: 'PlaceholderView',
  PlaceholderEdit: 'PlaceholderEdit',
  PlaceholderAdd: 'PlaceholderAdd',
  PlaceholderDelete: 'PlaceholderDelete',

  CategoryMappingView: 'CategoryMappingView',
  CategoryMappingEdit: 'CategoryMappingEdit',
  CategoryMappingAdd: 'CategoryMappingAdd',
  CategoryMappingDelete: 'CategoryMappingDelete',

  TemplateCategoryView: 'TemplateCategoryView',
  TemplateCategoryEdit: 'TemplateCategoryEdit',
  TemplateCategoryAdd: 'TemplateCategoryAdd',
  TemplateCategoryDelete: 'TemplateCategoryDelete',

  TemplateView: 'templateView',
  TemplateEdit: 'templateEdit',
  TemplateAdd: 'templateAdd',
  TemplateDelete: 'templateDelete',

  SuppliersView: 'SuppliersView',
  SuppliersEdit: 'SuppliersEdit',
  SuppliersAdd: 'SuppliersAdd',
  SuppliersDelete: 'SuppliersDelete',

  MaterialsView: 'MaterialsView',
  MaterialsEdit: 'MaterialsEdit',
  MaterialsAdd: 'MaterialsAdd',
  MaterialsDelete: 'MaterialsDelete',

  SupplierPriceView: 'SupplierPriceView',
  SupplierPriceEdit: 'SupplierPriceEdit',
  SupplierPriceAdd: 'SupplierPriceAdd',
  SupplierPriceDelete: 'SupplierPriceDelete',

  // Nutri farm — new modules
  DailyEntryView: 'DailyEntryView',
  DailyEntryEdit: 'DailyEntryEdit',
  DailyEntryAdd: 'DailyEntryAdd',
  DailyEntryDelete: 'DailyEntryDelete',

  ArchiveView: 'ArchiveView',
  ArchiveEdit: 'ArchiveEdit',
  ArchiveAdd: 'ArchiveAdd',
  ArchiveDelete: 'ArchiveDelete',

  PartiView: 'PartiView',
  PartiEdit: 'PartiEdit',
  PartiAdd: 'PartiAdd',
  PartiDelete: 'PartiDelete',

  SanitaView: 'SanitaView',
  SanitaEdit: 'SanitaEdit',
  SanitaAdd: 'SanitaAdd',
  SanitaDelete: 'SanitaDelete',

  FertilitaView: 'FertilitaView',
  FertilitaEdit: 'FertilitaEdit',
  FertilitaAdd: 'FertilitaAdd',
  FertilitaDelete: 'FertilitaDelete',

  MilkPriceHistoryView: 'MilkPriceHistoryView',
  MilkPriceHistoryEdit: 'MilkPriceHistoryEdit',
  MilkPriceHistoryAdd: 'MilkPriceHistoryAdd',
  MilkPriceHistoryDelete: 'MilkPriceHistoryDelete',
} as const;

export type PermissionKey = keyof typeof PERMISSIONS;
export type PermissionValue = (typeof PERMISSIONS)[PermissionKey];