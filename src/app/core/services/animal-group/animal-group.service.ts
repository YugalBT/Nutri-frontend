import { Injectable } from '@angular/core';
import { HttpService } from '../../../shared/services/http.service';
import { Observable, Subject, tap } from 'rxjs';
import { ApiResponse } from '../../models/api-response';
import { API_ENDPOINTS } from '../../constants/api-endpoints';
import { AnimalGroupList } from '../../models/animal-group-list';

@Injectable({
  providedIn: 'root'
})
export class AnimalGroupService {

   constructor(private http: HttpService) { }
    
    
      private animalGroupChangedSubject = new Subject<void>();
      animalGroupsChanged$ = this.animalGroupChangedSubject.asObservable();
    
      notifyanimalGroupsChanged() {
        this.animalGroupChangedSubject.next();
      }
    
      getAnimalGroupDetails(payload: any): Observable<ApiResponse<any>> {
        return this.http.post<AnimalGroupList[]>(API_ENDPOINTS.AnimalGroup.GET_ALL, payload);
      }
    
      createAnimalGroup(payload: any): Observable<ApiResponse<any>> {
        return this.http.post<any>(API_ENDPOINTS.AnimalGroup.CREATE, payload).pipe(
          tap(res => { if (res.isSuccess) this.notifyanimalGroupsChanged(); })
        );
      }
    
      updateAnimalGroup(payload: any): Observable<ApiResponse<any>> {
        return this.http.post<any>(API_ENDPOINTS.AnimalGroup.UPDATE, payload).pipe(
          tap(res => { if (res.isSuccess) this.notifyanimalGroupsChanged(); })
        );
      }
    
    
      activeInActive(animalGroupId: string): Observable<ApiResponse<any>> {
        const url = `${API_ENDPOINTS.AnimalGroup.ACTIVE_INACTIVE}?AnimalGroupId=${animalGroupId}`;
        return this.http.post<any>(url, {}).pipe(
          tap(res => { if (res.isSuccess) this.notifyanimalGroupsChanged(); })
        );;
      }
    
      deleteAnimalGroup(animalGroupId: string): Observable<ApiResponse<any>> {
        const url = `${API_ENDPOINTS.AnimalGroup.DELETE}?AnimalGroupId=${animalGroupId}`;
        return this.http.post<any>(url, {}).pipe(
          tap(res => { if (res.isSuccess) this.notifyanimalGroupsChanged(); })
        );
      }
}
