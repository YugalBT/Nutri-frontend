import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';

export interface ApiResponse<T> {
  isSuccess: boolean;
  message: string;
  data: T;
}


@Injectable({
  providedIn: 'root'
})
export class HttpService {

  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  get<T>(url: string, options: any = {}) {
    return this.http.get<T>(`${this.baseUrl}/${url}`, options);
  }

  post<T>(url: string, body: any, options: any = {}) {
    return this.http.post<T>(`${this.baseUrl}/${url}`, body, options);
  }

  put<T>(url: string, body: any, options: any = {}) {
    return this.http.put<T>(`${this.baseUrl}/${url}`, body, options);
  }

  delete<T>(url: string, options: any = {}) {
    return this.http.delete<T>(`${this.baseUrl}/${url}`, options);
  }
}
