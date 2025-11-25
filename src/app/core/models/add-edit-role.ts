export interface RoleItem {
  roleId: string;
  nameEn: string;
  nameIt?: string;
  isActive?: boolean;
  tenantId?: string;
  rolePermissionId?: string[];
}

export interface GetAllRolesResponse {
  isSuccess: boolean;
  message?: string;
  data: RoleItem[];
  totalRecords?: number;
}

export interface CreateUpdateRolePayload {
  nameEn: string;
  nameIt?: string;
  rolePermissionId?: string[];
  roleId?: string; // present for update
}

export interface RoleByIdResponse {
  isSuccess: boolean;
  message?: string;
  data: RoleItem;
}

export interface ModulePermission {
  permissionId: string;
  modulePermission: string | null;
  modulePermissionDisplay: string;
}

export interface Module {
  moduleName: string;
  moduleDisplayName: string;
  permissions: ModulePermission[];
}

export interface GetAllModulesResponse {
  isSuccess: boolean;
  message?: string;
  data: Module[];
  totalRecords?: number;
}