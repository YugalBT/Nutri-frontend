export interface Role{
  // normalized/common fields
  id?: string;
  name?: string;
  displayName?: string;

  // backend-specific fields (some APIs use these names)
  roleId?: string;
  roleName?: string;

  isActive?: boolean;
  tenantId?: string;
  rolePermissionId?: string[];
}


