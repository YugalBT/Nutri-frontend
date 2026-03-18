import { Injectable } from '@angular/core';
import { HttpService } from '../../../shared/services/http.service';
import { AuthInitService } from '../../auth/auth-init.service';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../models/api-response';
import { API_ENDPOINTS } from '../../constants/api-endpoints';

@Injectable({
  providedIn: 'root'
})
export class ChangePasswordService {

   constructor(
      private http: HttpService,
      private authInit: AuthInitService
    ) {
      this.authInit.initializeAuthState();
    }
  
    changePassword(payload: any): Observable<ApiResponse<any>> {
      return this.http.post<any>(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, payload);
    }

}
