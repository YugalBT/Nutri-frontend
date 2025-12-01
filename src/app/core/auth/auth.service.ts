import { Injectable } from '@angular/core';
import { catchError, Observable, of, tap } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { TokenService } from '../../shared/services/token.service';
import { HttpService } from '../../shared/services/http.service';
import { LoginRequest } from '../models/login-request';
import { ApiResponse } from '../models/api-response';



@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private http: HttpService,
    private tokenService: TokenService
  ) { }

  login(body: LoginRequest): Observable<ApiResponse<any>> {
    const payload: LoginRequest = {
      ...body,
      companyCode: body.companyCode ?? 'login'
    };

    return this.http.post<any>(API_ENDPOINTS.AUTH.LOGIN, payload).pipe(
      tap(res => {
        if (res?.isSuccess && res?.data?.token) {

          this.tokenService.setToken(res.data.token);
          this.tokenService.setUserData(JSON.stringify(res.data));
          this.tokenService.setUserName(`${res.data.firstName || ''} ${res.data.lastName || ''}`);

        }
        else {
          this.logout();
        }
      })
    );
  }


  logout() {
    this.tokenService.removeToken();
    this.tokenService.removeUserData();
    this.tokenService.removeUserUserName();

  }

 getHomePageContent(companyCode: string): Observable<ApiResponse<any>> {
  return this.http.get<any>(
    `${API_ENDPOINTS.AUTH.HOMEPAGE_CONTENT}?CompanyCode=${companyCode}`
  );
}


  isLoggedIn(): boolean {
    return this.tokenService.isLoggedIn();
  }
}
