
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/Auth/login',
    REGISTER: '/Auth/register',
    FORGET_PASSWORD: '/Auth/ForgetPassword',
    VERIFY_FORGET_PASSWORD: '/Auth/VerifyForgetPassword',
    PROFILE_UPDATE: '/Auth/ProfileUpdate',
    CHANGE_PASSWORD: '/Auth/ResetPassword',


  },

  USERS: {
    CREATE: '/User/Create',
    UPDATE: '/User/Update',
    DELETE: '/User/Delete',
    ACTIVE_INACTIVE: '/User/ActiveInActive',
    GET_ALL: '/User/GetAll',
  },

 ROLE: {
    CREATE: '/Role/Create',
    UPDATE: '/Role/Update',
    DELETE: '/Role/Delete',
    ACTIVE_INACTIVE: '/Role/ActiveInActive',
    GET_ALL: '/Role/GetAll',
  },

  COMMON_API: {
    GET_ALL_ROLES: '/Common/GetAllRoles',
    GET_ALL_NOTIFICATION: '/Common/GetAllNotification'

  },
  
  Module: {
    GET_ALL: '/Module/modules',
    GET_ALL_ROLES: '/Common/GetAllRoles'
  },
  
  Tenant: {
    GET_ALL: '/Tenant/GetAll',
    CREATE: '/Tenant/Create',
    UPDATE: '/Tenant/Update',
    DELETE: '/Tenant/Delete',
    ACTIVE_INACTIVE: '/Tenant/ActiveInActive',
  } 
};
