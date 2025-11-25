import { Injectable } from '@angular/core';
import { HttpService } from '../../../shared/services/http.service';
import { ModuleList } from '../../models/module-list';
import { ApiResponse } from '../../models/api-response';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../../constants/api-endpoints';

@Injectable({
  providedIn: 'root'
})
export class ModuleListService {

  constructor(private http: HttpService) {}

    getRoles(): Observable<ApiResponse<ModuleList[]>> {
      return this.http.get<ModuleList[]>(API_ENDPOINTS.Module.GET_ALL);
    }
  
}
