import { Injectable } from '@angular/core';
import { HttpService } from '../../../shared/services/http.service';
import { ApiResponse } from '../../models/api-response';
import { Observable, Subject } from 'rxjs';
import { API_ENDPOINTS } from '../../constants/api-endpoints';
import { AnimaTypeList } from '../../models/animaltype-list';

@Injectable({
  providedIn: 'root'
})
export class AnimaltypeService {
  notifyChanges() {
    this.AnimalTypeChangedSubject.next();
  }
  changed$: any;

  constructor(private http: HttpService) { }

  private AnimalTypeChangedSubject = new Subject<void>();
    animalTypeChanged$ = this.AnimalTypeChangedSubject.asObservable();

   getAnimalTypes(payload: any): Observable<ApiResponse<AnimaTypeList[]>> {
      return this.http.post<AnimaTypeList[]>(API_ENDPOINTS.AnimalType.GET_ALL, payload);
    }
  
    createAnimalType(payload: any): Observable<ApiResponse<any>> {
      return this.http.post<any>(API_ENDPOINTS.AnimalType.CREATE, payload);
    }
  
    updateAnimalType(payload: any): Observable<ApiResponse<any>> {
      return this.http.post<any>(API_ENDPOINTS.AnimalType.UPDATE, payload);
    }

    activeInActiveAnimalType(animalTypeId: string, IsActive: boolean): Observable<ApiResponse<any>> {
    const url = `${API_ENDPOINTS.AnimalType.ACTIVE_INACTIVE}?AnimalTypeId=${animalTypeId}&IsActive=${IsActive}`;
    return this.http.post<any>(url, {});
  }

   deleteAnimalType(animalTypeId: string): Observable<ApiResponse<any>> {
    const url = `${API_ENDPOINTS.AnimalType.DELETE}?AnimalTypeId=${animalTypeId}`;
    return this.http.post<any>(url, {});
  }
}
