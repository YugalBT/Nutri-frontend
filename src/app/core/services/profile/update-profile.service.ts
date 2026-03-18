import { Injectable } from '@angular/core';
import { HttpService } from '../../../shared/services/http.service';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../models/api-response';
import { API_ENDPOINTS } from '../../constants/api-endpoints';
import { AuthService } from '../../auth/auth.service';
import { AuthInitService } from '../../auth/auth-init.service';

@Injectable({
  providedIn: 'root'
})
export class UpdateProfileService {

  constructor(
    private http: HttpService,
    private authInit: AuthInitService
  ) {
    this.authInit.initializeAuthState();
  }

  updateProfile(payload: FormData): Observable<ApiResponse<any>> {
    return this.http.post<any>(API_ENDPOINTS.AUTH.PROFILE_UPDATE, payload);
  }

  profileDetails(): Observable<ApiResponse<any>> {
  return this.http.post<any>(API_ENDPOINTS.AUTH.PROFILE_DETAILS, {});
}

  
}
