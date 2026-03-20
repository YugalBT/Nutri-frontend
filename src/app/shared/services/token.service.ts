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
  setIsSuperAdmin(isSuperAdmin: boolean | false) {
    localStorage.setItem(Constants.IsSuperAdmin, isSuperAdmin.toString());
  }
  getToken(): string | null {
    return localStorage.getItem(Constants.AUTHTOKEN);
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

  setSupplierData(data: any) {
  localStorage.setItem('SUPPLIER_DATA', JSON.stringify(data));
}

getSupplierData(): any {
  const data = localStorage.getItem('SUPPLIER_DATA');
  return data ? JSON.parse(data) : null;
}

removeSupplierData() {
  localStorage.removeItem('SUPPLIER_DATA');
}
getSupplierId(): string | null {
  const supplier = this.getSupplierData();
  return supplier?.supplierId || null;
}
getSupplier(): any {
  return this.getSupplierData();
}
isSupplier(): boolean {
  return !!this.getSupplierData();
}

}
