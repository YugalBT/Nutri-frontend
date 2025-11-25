import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { HttpService } from './http.service';
import { ApiResponse } from '../../core/models/api-response';
import { Constants } from '../utils/constants/constants';
import { API_ENDPOINTS } from '../../core/constants/api-endpoints';
import { UserList } from '../../core/models/userlist';

@Injectable({ providedIn: 'root' })
export class UsersService {
  constructor(private http: HttpService) {}

  private usersChangedSubject = new Subject<void>();
  usersChanged$ = this.usersChangedSubject.asObservable();

  notifyUsersChanged() {
    this.usersChangedSubject.next();
  }


  // getUsers(payload: any): Observable<ApiResponse<UserList[]>> {
  //   return this.http.post<UserList[]>(API_ENDPOINTS.USERS.GET_ALL, payload);
  // }
  // createUser(payload: any): Observable<ApiResponse<any>> {
  //   return this.http.post<any>(API_ENDPOINTS.USERS.CREATE, payload);
  // }

  // updateUser(payload: any): Observable<ApiResponse<any>> {
  //   return this.http.post<any>(API_ENDPOINTS.USERS.UPDATE, payload);
  // }
}
