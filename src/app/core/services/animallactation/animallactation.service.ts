import { Injectable } from '@angular/core';
import { HttpService } from '../../../shared/services/http.service';
import { Observable, Subject, tap } from 'rxjs';
import { ApiResponse } from '../../models/api-response';
import { AnimallactationList } from '../../models/animallactation-list';
import { API_ENDPOINTS } from '../../constants/api-endpoints';

@Injectable({
  providedIn: 'root'
})
export class AnimallactationService {

   constructor(private http: HttpService) { }
  
  
    private animalLactationChangedSubject = new Subject<void>();
    animalLactationsChanged$ = this.animalLactationChangedSubject.asObservable();
  
    notifyanimalLactationsChanged() {
      this.animalLactationChangedSubject.next();
    }
  
    getaAnimalLactationDetails(payload: any): Observable<ApiResponse<any>> {
      return this.http.post<AnimallactationList[]>(API_ENDPOINTS.AnimalLactation.GET_ALL, payload);
    }
  
    createaAnimalLactation(payload: any): Observable<ApiResponse<any>> {
      return this.http.post<any>(API_ENDPOINTS.AnimalLactation.CREATE, payload).pipe(
        tap(res => { if (res.isSuccess) this.notifyanimalLactationsChanged(); })
      );
    }
  
    updateAnimalLactation(payload: any): Observable<ApiResponse<any>> {
      return this.http.post<any>(API_ENDPOINTS.AnimalLactation.UPDATE, payload).pipe(
        tap(res => { if (res.isSuccess) this.notifyanimalLactationsChanged(); })
      );
    }
  
  
    activeInActive(animalLactationId: string): Observable<ApiResponse<any>> {
      const url = `${API_ENDPOINTS.AnimalLactation.ACTIVE_INACTIVE}?AnimalLactationId=${animalLactationId}`;
      return this.http.post<any>(url, {}).pipe(
        tap(res => { if (res.isSuccess) this.notifyanimalLactationsChanged(); })
      );;
    }
  
    deleteAnimalLactations(animalLactationId: string): Observable<ApiResponse<any>> {
      const url = `${API_ENDPOINTS.AnimalLactation.DELETE}?AnimalLactationId=${animalLactationId}`;
      return this.http.post<any>(url, {}).pipe(
        tap(res => { if (res.isSuccess) this.notifyanimalLactationsChanged(); })
      );
    }
}
