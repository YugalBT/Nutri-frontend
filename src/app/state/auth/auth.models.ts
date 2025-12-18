// auth.models.ts
export interface User {
  userId: string;
  username: string;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  suffix?: string | null;
  email: string;
  phone?: string | null;
  code?: string | null;
  logo?: string | null;
  primaryColor?: string;
  secondaryColor?: string;
  companyName?: string;
  tenantId: string;
  parentTenantId?: string | null;
  isCompany?: boolean;
  hashedPassword?: string | null;
  isPasswordHash?: boolean | null;
  isSuperAdmin?: boolean | null;
  isFirstLogin?: boolean | null;
  roles?: string[];
  menu?: any[];
  permissions: Permission[]
}
export interface Permission {
  permissionId: string
  modulePermission: any
  modulePermissionDisplay: string
}

export interface AuthResponse {
  token: string;
  user: User;
  permissions: Permission[];
}
