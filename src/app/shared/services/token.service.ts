import { Injectable } from '@angular/core';
import { Constants } from '../utils/constants/constants';

@Injectable({
  providedIn: 'root'
})
export class TokenService {


  setToken(token: string) {
    localStorage.setItem(Constants.AUTHTOKEN, token);
  }
  setUserData(token: string) {
    localStorage.setItem(Constants.USERDATA, token);
  }
  setUserName(token: string) {
    localStorage.setItem(Constants.USERNAME, token);
  }

  getToken(): string | null {
    return localStorage.getItem(Constants.AUTHTOKEN);
  }

   getUserData(): string | null {
    return localStorage.getItem(Constants.USERDATA);
  }

  getUserName(): string | null {
    return localStorage.getItem(Constants.USERNAME);
  }

  removeToken() {
    localStorage.removeItem(Constants.AUTHTOKEN);
  }
  removeUserData() {
    localStorage.removeItem(Constants.USERDATA);
  }
  removeUserUserName() {
    localStorage.removeItem(Constants.USERNAME);
  }


  clearAll() {
    localStorage.clear();
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
