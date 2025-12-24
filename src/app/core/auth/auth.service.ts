import { Injectable } from '@angular/core';
import { catchError, Observable, of, tap } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { TokenService } from '../../shared/services/token.service';
import { HttpService } from '../../shared/services/http.service';
import { LoginRequest } from '../models/login-request';
import { ApiResponse } from '../models/api-response';
import { TranslateService } from '../../i18n/translate.service';
import { ConfirmDialogService } from '../../shared/services/confirm-dialog.service';
import { ToastService } from '../../shared/services/toast.service';
import { Router } from '@angular/router';
import { Constants } from '../../shared/utils/constants/constants';
import { ROUTE_CONST } from '../constants/route.constants';
import { HttpHeaders } from '@angular/common/http';



@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private http: HttpService,
    // private translate: TranslateService,
    private confirm: ConfirmDialogService,
    private toast: ToastService,
    private router: Router,
    private tokenService: TokenService
  ) { }

  // login(body: LoginRequest): Observable<ApiResponse<any>> {
  //   const payload: LoginRequest = {
  //     ...body
  //     // companyCode: body.companyCode ?? 'login'
  //   };

  //   return this.http.post<any>(API_ENDPOINTS.AUTH.LOGIN, payload).pipe(
  //     tap(res => {
  //       if (res?.isSuccess && res?.data?.token) {

  //         this.tokenService.setToken(res.data.token);
  //         this.tokenService.setUserData(JSON.stringify(res.data));
  //         this.tokenService.setUserName(`${res.data.firstName || ''} ${res.data.lastName || ''}`);

  //       }
  //       // else {
  //       //   this.logout();
  //       // }
  //     })
  //   );
  // }

  login(body: LoginRequest): Observable<ApiResponse<any>> {

    const language = sessionStorage.getItem('lang') || 'en';

    const headers = new HttpHeaders({
      'Accept-Language': language
    });

    return this.http.post<any>(
      API_ENDPOINTS.AUTH.LOGIN,
      body,
      { headers }
    ).pipe(
      tap(res => {
        if (res.isSuccess && res.data?.token) {
          this.tokenService.setToken(res.data.token);
          this.tokenService.setUserData(JSON.stringify(res.data));
          this.tokenService.setUserName(
            `${res.data.firstName} ${res.data.lastName}`
          );
        }
      })
    );
  }

  logout() {
    this.confirm.confirm(
      'dialog.logoutMessage'
    ).subscribe(result => {
      if (result) {
        let companyCode = '';
        const rawCompany = sessionStorage.getItem('companyInfo');
        if (rawCompany) {
          try {
            const parsed = JSON.parse(rawCompany);
            if (Array.isArray(parsed)) {
              companyCode = parsed[0]?.companyCode ?? parsed[0]?.code ?? '';
            } else {
              companyCode = parsed?.companyCode ?? parsed?.code ?? '';
            }
          } catch {
            // if not JSON, treat stored value as plain string
            companyCode = rawCompany;
          }
        }
        sessionStorage.clear();
        this.toast.success(Constants.LOGOUT_SUCCESS);
        //const normalizedCompany = companyCode ? companyCode.toString().replace(/^\/+|\/+$/g, '') : '';
        // const target = normalizedCompany ? `/${normalizedCompany}/login` : '/404';
        this.router.navigateByUrl(ROUTE_CONST.LOGIN);
      }
    });
  }

  // logout() {
  //   this.tokenService.removeToken();
  //   this.tokenService.removeUserData();
  //   this.tokenService.removeUserUserName();

  // }

  // getHomePageContent(companyCode: string): Observable<ApiResponse<any>> {
  //   return this.http.get<any>(
  //     `${API_ENDPOINTS.AUTH.HOMEPAGE_CONTENT}?CompanyCode=${companyCode}`
  //   );
  // }


  isLoggedIn(): boolean {
    return this.tokenService.isLoggedIn();
  }
}
