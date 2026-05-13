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
  roleName?: string;
  tenantId: string;
  parentTenantId?: string | null;
  isCompany?: boolean;
  hashedPassword?: string | null;
  isPasswordHash?: boolean | null;
  isSuperAdmin?: boolean | null;
  isAdmin?: boolean | null;
  isFirstLogin?: boolean | null;
  roles?: string[];
  menu?: any[];
  roleType?: 'ADMIN' | 'COLLABORATOR' | 'CLIENT' | string;
  allowedCompanyIds?: string[];
  companyMenu?: string[];
  permissions: Permission[];
  supplierDetails?: SupplierDetails | null;
}
export interface Permission {
  permissionId: string;
  modulePermission: any;
  modulePermissionDisplay: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  permissions: Permission[];
}

export interface SupplierDetails {
  supplierId: string;
  supplierName: string;
  firstName: string;
  lastName: string;
  emailAddress: string;
  phoneNumber: string;
  city?: string;
  state?: string;
  streetAddress?: string;
  zipCode?: string;
  isActive: boolean;
}
