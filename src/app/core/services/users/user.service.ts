import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { HttpService } from '../../../shared/services/http.service';
import { ApiResponse } from '../../models/api-response';
import { API_ENDPOINTS } from '../../constants/api-endpoints';
import { UserList } from '../../models/userlist';

@Injectable({ providedIn: 'root' })
export class UsersService {
  constructor(private http: HttpService) {}

  private usersChangedSubject = new Subject<void>();
  usersChanged$ = this.usersChangedSubject.asObservable();

  notifyUsersChanged() {
    this.usersChangedSubject.next();
  }

  getUsers(payload: any): Observable<ApiResponse<UserList[]>> {
    return this.http.post<UserList[]>(API_ENDPOINTS.USERS.GET_ALL, payload);
  }

  createUser(payload: any): Observable<ApiResponse<any>> {
    return this.http.post<any>(API_ENDPOINTS.USERS.CREATE, payload);
  }

  updateUser(payload: any): Observable<ApiResponse<any>> {
    return this.http.post<any>(API_ENDPOINTS.USERS.UPDATE, payload);
  }

  /**
   * Toggle active/inactive for a user. The backend expects the user id as a query parameter.
   * Example: POST /User/ActiveInActive?UserId=<id>
   */
  activeInActive(userId: string): Observable<ApiResponse<any>> {
    const url = `${API_ENDPOINTS.USERS.ACTIVE_INACTIVE}?UserId=${userId}`;
    return this.http.post<any>(url, {});
  }

  /**
   * Delete a user by id. Backend expects the id as query param.
   * Example: POST /User/Delete?UserId=<id>
   */
  deleteUser(userId: string): Observable<ApiResponse<any>> {
    const url = `${API_ENDPOINTS.USERS.DELETE}?UserId=${userId}`;
    return this.http.post<any>(url, {});
  }
}
