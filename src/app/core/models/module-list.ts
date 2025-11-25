export interface ModuleList {
  moduleName?: string
  moduleDisplayName?: string
  permissions?: Permission[]
}

export interface Permission {
  permissionId?: string
  modulePermission?: any
  modulePermissionDisplay?: string
}
