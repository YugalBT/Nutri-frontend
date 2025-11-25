import { Injectable } from '@angular/core';
import { HttpService } from '../../../shared/services/http.service';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../models/api-response';
import { NotificationList } from '../../models/notification-list';
import { API_ENDPOINTS } from '../../constants/api-endpoints';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(
    private http: HttpService
  ) { }

  getNotificationList(): Observable<ApiResponse<NotificationList>> {
      return this.http.get<NotificationList>(`${API_ENDPOINTS.COMMON_API?.GET_ALL_NOTIFICATION}`);
    }
}
