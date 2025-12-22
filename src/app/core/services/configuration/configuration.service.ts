import { Injectable } from '@angular/core';
import { HttpService } from '../../../shared/services/http.service';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../models/api-response';
import { API_ENDPOINTS } from '../../constants/api-endpoints';

@Injectable({
  providedIn: 'root'
})
export class ConfigurationService {

   constructor(
      private http: HttpService,
    ) {
  
    }
  
    updateConfiguration(payload: any): Observable<ApiResponse<any>> {
      return this.http.post<any>(API_ENDPOINTS.CONFIGURATION.UPDATE, payload);
    }

   getConfiguration(): Observable<ApiResponse<any>> {
    return this.http.get<any>(API_ENDPOINTS.CONFIGURATION.GET_CONFIGURATION);
  }
}
