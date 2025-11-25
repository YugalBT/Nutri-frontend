
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/Auth/login',
    REGISTER: '/api/Auth/register',
    FORGET_PASSWORD: '/api/Auth/ForgetPassword',
    VERIFY_FORGET_PASSWORD: '/api/Auth/VerifyForgetPassword',
  },

  USERS: {
    CREATE: '/User/Create',
    UPDATE: '/User/Update',
    DELETE: '/User/Delete',
    ACTIVE_INACTIVE: '/User/ActiveInActive',
    GET_ALL: '/User/GetAll',
  },
  COMMON_API: {
    GET_ALL_ROLES: '/Common/GetAllRoles'
  }
};
