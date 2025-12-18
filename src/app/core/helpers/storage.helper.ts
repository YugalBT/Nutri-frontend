import { Constants } from "../../shared/utils/constants/constants";

export  class StorageHelper {
  
  static set(key: string, data: any): void {
    sessionStorage.setItem(key, JSON.stringify(data));
  }

  static get(key: string): any {
    return JSON.parse(sessionStorage.getItem(key) || 'null');
  }

  static remove(key: string): void {
    sessionStorage.removeItem(key);
  }

  static CheckRole(roleName: string): boolean {
    const userDataString = sessionStorage.getItem(Constants.USERDATA);
    if (!userDataString) return false;
  
    const userData = JSON.parse(userDataString);
    const roles: string[] = userData?.roles || [];
    return roles.includes(roleName);
  }
}
