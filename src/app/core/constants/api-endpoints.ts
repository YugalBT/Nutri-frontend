
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
    GET_TEMPLATE_CATEGORY: '/Common/GetAllTemplateCategory',
    GET_TEMPLATE_PLACEHOLDER: '/Common/GetAllPlaceholder',
    GET_RATION: '/Common/GetAllRation',
    GET_OPERATOR: '/Common/GetAllOperator',
    GET_OPERATORS_AND_RATIONS: '/Common/GetAllOperatorAndRation',
    GET_ANIMALGROUPS_BY_FARM_ID: '/Common/GetAnimalGroupByFarmId',
    GET_FEEDS_BY_FARM_ID: '/Common/GetFeedByFarmId',
    GET_PLACEHOLDER_BY_CATEGORY_ID: '/Common/GetAllPlaceholderByCategoryId'
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
  CONFIGURATION: {
    UPDATE: '/Configuration/AddOrUpdateEmailConfiguration',
    GET_CONFIGURATION: '/Configuration/GetEmailConfiguration',
  },
   TemplateCategory: {
    CREATE: '/TemplateCategory/Create',
    UPDATE: '/TemplateCategory/Update',
    DELETE: '/TemplateCategory/Delete',
    ACTIVE_INACTIVE: '/TemplateCategory/ActiveInActive',
    GET_ALL: '/TemplateCategory/GetAll',
  },

  Template: {
    CREATE: '/Template/Create',
    UPDATE: '/Template/Update',
    DELETE: '/Template/Delete',
    ACTIVE_INACTIVE: '/Template/ActiveInActive',
    GET_ALL: '/Template/GetAll',
  },
   OPERATOR: {
    CREATE: '/Operator/Create',
    UPDATE: '/Operator/Update',
    DELETE: '/Operator/Delete',
    ACTIVE_INACTIVE: '/Operator/ActiveInActive',
    GET_ALL: '/Operator/GetAll',
  },
   PLACEHOLDER: {
    CREATE: '/PlaceHolder/Create',
    UPDATE: '/PlaceHolder/Update',
    DELETE: '/PlaceHolder/Delete',
    ACTIVE_INACTIVE: '/PlaceHolder/ActiveInActive',
    GET_ALL: '/PlaceHolder/GetAll',
  },
   PLACEHOLDERS_MAPPING: {
    CREATE: '/PlaceholderMapping/Create',
    UPDATE: '/PlaceholderMapping/Update',
    DELETE: '/PlaceholderMapping/Delete',
    ACTIVE_INACTIVE: '/PlaceholderMapping/ActiveInActive',
    GET_ALL: '/PlaceholderMapping/GetAll',
  },
   FORMULA: {
    CREATE: '/Formula/Create',
    UPDATE: '/Formula/Update',
    DELETE: '/Formula/Delete',
    ACTIVE_INACTIVE: '/Formula/ActiveInActive',
    GET_ALL: '/Formula/GetAll',
  },
};
