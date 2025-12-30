import { Constants } from "../../shared/utils/constants/constants";

export  class StorageHelper {
  
  static set(key: string, data: any): void {
    localStorage.setItem(key, JSON.stringify(data));
  }

  static get(key: string): any {
    return JSON.parse(localStorage.getItem(key) || 'null');
  }

  static remove(key: string): void {
    localStorage.removeItem(key);
  }

  static CheckRole(roleName: string): boolean {
    const userDataString = localStorage.getItem(Constants.USERDATA);
    if (!userDataString) return false;
  
    const userData = JSON.parse(userDataString);
    const roles: string[] = userData?.roles || [];
    return roles.includes(roleName);
  }
}
