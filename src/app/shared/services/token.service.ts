import { Injectable } from '@angular/core';
import { Constants } from '../utils/constants/constants';

@Injectable({
  providedIn: 'root'
})
export class TokenService {


  setToken(token: string) {
    sessionStorage.setItem(Constants.AUTHTOKEN, token);
  }
  setUserData(token: string) {
    sessionStorage.setItem(Constants.USERDATA, token);
  }
  setUserName(token: string) {
    sessionStorage.setItem(Constants.USERNAME, token);
  }
  setIsSuperAdmin(isSuperAdmin: boolean | false) {
    sessionStorage.setItem(Constants.IsSuperAdmin, isSuperAdmin.toString());
  }
  getToken(): string | null {
    return sessionStorage.getItem(Constants.AUTHTOKEN);
  }

 
  private decodePayload(token: string): any | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const payload = parts[1];
      const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decodeURIComponent(escape(json)));
    } catch (e) {
      return null;
    }
  }

  
  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;
    const payload = this.decodePayload(token);
    if (!payload || !payload.exp) return true;
    const now = Math.floor(Date.now() / 1000);
    return payload.exp <= now;
  }




  getUserData(): string | null {
    return sessionStorage.getItem(Constants.USERDATA);
  }

  getUserName(): string | null {
    return sessionStorage.getItem(Constants.USERNAME);
  }

  removeToken() {
    sessionStorage.removeItem(Constants.AUTHTOKEN);
  }
  removeUserData() {
    sessionStorage.removeItem(Constants.USERDATA);
  }
  removeUserUserName() {
    sessionStorage.removeItem(Constants.USERNAME);
  }


  clearAll() {
    sessionStorage.clear();
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
