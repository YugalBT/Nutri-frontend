import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';
import { Observable, of, catchError, map } from 'rxjs';
import { ApiResponse } from '../../core/models/api-response';



@Injectable({
  providedIn: 'root'
})
export class HttpService {
  
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {

  }

 private handleResponse<T>(obs: Observable<T>): Observable<ApiResponse<T>> {
  return obs.pipe(
    map((res: any) => ({
      isSuccess: res?.isSuccess,
      message: res?.message,
      data: res?.data ?? res ?? null,
      totalRecords: res?.totalRecords ?? null
    })),
    catchError((error) => {
      let msg = 'Something went wrong';

      if (error?.error?.errors) {
        msg = Object.values(error.error.errors)
          .flat()
          .join(', ');
      } else if (error?.error?.message) {
        msg = error.error.message;
      } else if (error?.message) {
        msg = error.message;
      }

      return of({
        isSuccess: false,
        message: msg,
        data: null
      } as ApiResponse<T>);
    })
  );
}



  get<T>(url: string, options: { headers?: HttpHeaders } = {}): Observable<ApiResponse<T>> {
    return this.handleResponse(
      this.http.get<T>(`${this.baseUrl}${url}`, { ...options, observe: 'body' })
    );
  }

  post<T>(url: string, body: any, options: { headers?: HttpHeaders } = {}): Observable<ApiResponse<T>> {
    return this.handleResponse(
      this.http.post<T>(`${this.baseUrl}${url}`, body, { ...options, observe: 'body' })
    );
  }

  getFile(url: string): Observable<Blob> {
  return this.http.get(url, {
    responseType: 'blob'
  });
}
  // Uncomment and fix these if needed
  /*
  put<T>(url: string, body: any, options: { headers?: HttpHeaders } = {}): Observable<ApiResponse<T>> {
    return this.handleResponse(
      this.http.put<T>(`${this.baseUrl}/${url}`, body, { ...options, observe: 'body' })
    );
  }

  delete<T>(url: string, options: { headers?: HttpHeaders } = {}): Observable<ApiResponse<T>> {
    return this.handleResponse(
      this.http.delete<T>(`${this.baseUrl}/${url}`, { ...options, observe: 'body' })
    );
  }
  */
}
