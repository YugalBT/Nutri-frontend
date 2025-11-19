import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { TokenService } from '../../shared/services/token.service';
import { HttpService } from '../../shared/services/http.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

   constructor(
    private http: HttpService,
    private tokenService: TokenService
  ) {}

  login(body: { email: string; password: string }): Observable<any> {
    return this.http.post(API_ENDPOINTS.AUTH.LOGIN, body).pipe(
      tap((res: any) => {
        if (res?.token) {
          this.tokenService.setToken(res.token);
        }
      })
    );
  }

  logout() {
    this.tokenService.removeToken();
  }

  isLoggedIn() {
    return this.tokenService.isLoggedIn();
  }
}
