import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { CommonService } from '../../../shared/services/common.service';
import {RoleList } from '../../models/rolelist';

@Injectable({
  providedIn: 'root'
})
export class RolelistService {
  private roles$ = new BehaviorSubject<RoleList[] | null>(null);

  constructor(private commonService: CommonService) { }

 
  getRoles(forceRefresh = false): Observable<RoleList[]> {
    const cached = this.roles$.value;
    if (!forceRefresh && cached) {
      return of(cached);
    }

      return this.commonService.getRoles().pipe(
        map(res => res.data ?? []),
        tap((roles: RoleList[]) => this.roles$.next(roles))
      );
  }


  clearCache() {
    this.roles$.next(null);
  }

  rolesObservable(): Observable<RoleList[] | null> {
    return this.roles$.asObservable();
  }
}
