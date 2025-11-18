import { Injectable } from '@angular/core';
import { HttpService } from '../services/http.service';
import { TokenService } from '../services/token.service';
import { Observable, tap } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api-endpoints';

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
