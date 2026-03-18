import { Injectable } from '@angular/core';
import { HttpService } from '../../../shared/services/http.service';
import { Observable, Subject, tap } from 'rxjs';
import { Calfbarnlist } from '../../models/calfbarnlist';
import { ApiResponse } from '../../models/api-response';
import { API_ENDPOINTS } from '../../constants/api-endpoints';

@Injectable({
  providedIn: 'root'
})
export class CalfbarnService {

 constructor(private http: HttpService) { }
     
     
       private calfbarnChangedSubject = new Subject<void>();
       calfbarnChanged$ = this.calfbarnChangedSubject.asObservable();
     
       notifycalfbarnChanged() {
         this.calfbarnChangedSubject.next();
       }
     
       getcalfbarnDetails(payload: any): Observable<ApiResponse<Calfbarnlist[]>> {
         return this.http.post<Calfbarnlist[]>(API_ENDPOINTS.CALFBARN.GET_ALL, payload);
       }
     
       createcalfbarn(payload: any): Observable<ApiResponse<any>> {
         return this.http.post<any>(API_ENDPOINTS.CALFBARN.CREATE, payload).pipe(
           tap(res => { if (res.isSuccess) this.notifycalfbarnChanged(); })
         );
       }
     
       updatecalfbarn(payload: any): Observable<ApiResponse<any>> {
         return this.http.post<any>(API_ENDPOINTS.CALFBARN.UPDATE, payload).pipe(
           tap(res => { if (res.isSuccess) this.notifycalfbarnChanged(); })
         );
       }
     
     
       activeInActive(calfbarnId: string): Observable<ApiResponse<any>> {
         const url = `${API_ENDPOINTS.CALFBARN.ACTIVE_INACTIVE}?calfbarnId=${calfbarnId}`;
         return this.http.post<any>(url, {}).pipe(
           tap(res => { if (res.isSuccess) this.notifycalfbarnChanged(); })
         );;
       }
     
       deletecalfbarn(calfbarnId: string): Observable<ApiResponse<any>> {
         const url = `${API_ENDPOINTS.CALFBARN.DELETE}?calfbarnId=${calfbarnId}`;
         return this.http.post<any>(url, {}).pipe(
           tap(res => { if (res.isSuccess) this.notifycalfbarnChanged(); })
         );
       }
}
