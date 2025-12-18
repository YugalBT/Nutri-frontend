
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/Auth/login',
    REGISTER: '/Auth/register',
    FORGET_PASSWORD: '/Auth/ForgetPassword',
    VERIFY_FORGET_PASSWORD: '/Auth/VerifyForgetPassword',
    PROFILE_UPDATE: '/Auth/ProfileUpdate',
    PROFILE_DETAILS: '/Auth/ProfileDetails',
    CHANGE_PASSWORD: '/Auth/ResetPassword',
    HOMEPAGE_CONTENT: '/Auth/HomePageContent',



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
    GET_ALL_NOTIFICATION: '/Common/GetAllNotification',
    GET_ALL_FARMS: '/Common/GetAllFarm',
    GET_ALL_FEED: '/Common/GetAllFeed',
    GET_ALL_Days: '/Common/GetAllDay',
    GET_ALL_ANIMALTYPE: '/Common/GetAllAnimalType',
    GET_ALL_ANIMAL_LACTATION: '/Common/GetAllAnimalLactation',
    GET_ALL_ANIMAL_GROUP: '/Common/GetAllAnimalGroup',
    GET_RATION_ITEMS: '/Common/GetRationByRationd',
  },
  
  
  Module: {
    GET_ALL: '/Module/modules',
    GET_ALL_ROLES: '/Common/GetAllRoles',
    CREATE: '/Module/Add',
    DELETE: '/Module/Delete',
    UPDATE: '/Module/Edit',

  },
  
  Tenant: {
    GET_ALL: '/Tenant/GetAll',
    CREATE: '/Tenant/Create',
    UPDATE: '/Tenant/Update',
    DELETE: '/Tenant/Delete',
    ACTIVE_INACTIVE: '/Tenant/ActiveInActive',
  },

  FARM: {
    CREATE: '/Farm/Create',
    UPDATE: '/Farm/Update',
    DELETE: '/Farm/Delete',
    ACTIVE_INACTIVE: '/Farm/ActiveInActive',
    GET_ALL: '/Farm/GetAll',
  },
   RATION: {
    CREATE: '/Ration/Create',
    UPDATE: '/Ration/Update',
    DELETE: '/Ration/Delete',
    ACTIVE_INACTIVE: '/Ration/ActiveInActive',
    GET_ALL: '/Ration/GetAll',
  },
  FEED: {
    CREATE: '/Feed/Create',
    UPDATE: '/Feed/Update',
    DELETE: '/Feed/Delete',
    ACTIVE_INACTIVE: '/Feed/ActiveInActive',
    GET_ALL: '/Feed/GetAll',
  },
   DAY: {
    CREATE: '/Day/Create',
    UPDATE: '/Day/Update',
    DELETE: '/Day/Delete',
    ACTIVE_INACTIVE: '/Day/ActiveInActive',
    GET_ALL: '/Day/GetAll',
  },
   CALVES: {
    CREATE: '/Calves/Create',
    UPDATE: '/Calves/Update',
    DELETE: '/Calves/Delete',
    ACTIVE_INACTIVE: '/Calves/ActiveInActive',
    GET_ALL: '/Calves/GetAll',
  },

   AnimalType: {
    CREATE: '/Animal/CreateAnimalType',
    UPDATE: '/Animal/UpdateAnimalType',
    DELETE: '/Animal/DeleteAnimalType',
    ACTIVE_INACTIVE: '/Animal/ActiveInactiveAnimalType',
    GET_ALL: '/Animal/GetAllAnimalType',
  },

  AnimalLactation: {
    CREATE: '/Animal/CreateAnimalLactation',
    UPDATE: '/Animal/UpdateAnimalLactation',
    DELETE: '/Animal/DeleteAnimalLactation',
    ACTIVE_INACTIVE: '/Animal/ActiveInactiveLactation',
    GET_ALL: '/Animal/GetAllLactation',
  },
  AnimalGroup: {
    CREATE: '/Animal/CreateAnimalGroup',
    UPDATE: '/Animal/UpdateAnimalGroup',
    DELETE: '/Animal/DeleteAnimalGroup',
    ACTIVE_INACTIVE: '/Animal/ActiveInactiveAnimalGroup',
    GET_ALL: '/Animal/GetAllAnimalGroup',
  },
   COMPANY: {
    UPDATE: '/Common/UpdateSettingById',
    GET_BY_ID: '/Common/SettingById',
  },
};
