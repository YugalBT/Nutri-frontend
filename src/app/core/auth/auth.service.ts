import { Injectable } from '@angular/core';
import { HttpService } from '../services/http.service';
import { TokenService } from '../services/token.service';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

   constructor(
    private http: HttpService,
    private tokenService: TokenService
  ) {}

  login(body: { email: string; password: string }): Observable<any> {
    return this.http.post('Auth/login', body).pipe(
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
