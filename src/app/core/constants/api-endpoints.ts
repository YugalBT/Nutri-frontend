
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/Auth/login',
    REGISTER: '/api/Auth/register',
    FORGET_PASSWORD: '/api/Auth/ForgetPassword',
    VERIFY_FORGET_PASSWORD: '/api/Auth/VerifyForgetPassword',
  },

  USERS: {
    GET_ALL: '/api/Users',
    GET_BY_ID: (id: number) => `/api/Users/${id}`,
  }
};
