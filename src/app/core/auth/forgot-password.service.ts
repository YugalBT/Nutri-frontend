import { Injectable } from '@angular/core';
import { HttpService } from '../../shared/services/http.service';
import { TokenService } from '../../shared/services/token.service';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { ApiResponse } from '../models/api-response';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ForgotPasswordService {
 
   constructor(private http: HttpService) {}


  sendForgotPassword(body: { email: string }): Observable<any> {
    return this.http.post(API_ENDPOINTS.AUTH.FORGET_PASSWORD, body);
  }

  verifyForgotPassword(body: { token: string; password: string }): Observable<any> {
    return this.http.post(API_ENDPOINTS.AUTH.VERIFY_FORGET_PASSWORD, body);
  }

}
