export interface AddEditUser {
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  phone: string;
  suffix?: string;
  roleId?: string;
  password?: string;
}
