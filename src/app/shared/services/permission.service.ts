import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectUserRoles } from '../../state/auth/auth.selectors';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  userRoles$: Observable<string[]>;

  constructor(private store: Store) {
    this.userRoles$ = this.store.select(selectUserRoles);
  }

  /**
   * Check if user has a specific permission
   * @param permission - Single permission string
   * @returns Observable<boolean>
   */
  hasPermission(permission: string): Observable<boolean> {
    return this.userRoles$.pipe(
      map(roles => (roles || []).includes(permission))
    );
  }

  /**
   * Check if user has any of the given permissions
   * @param permissions - Array of permission strings
   * @returns Observable<boolean>
   */
  hasAnyPermission(permissions: string[]): Observable<boolean> {
    return this.userRoles$.pipe(
      map(roles => {
        if (!roles) return false;
        return permissions.some(perm => roles.includes(perm));
      })
    );
  }

  /**
   * Check if user has all given permissions
   * @param permissions - Array of permission strings
   * @returns Observable<boolean>
   */
  hasAllPermissions(permissions: string[]): Observable<boolean> {
    return this.userRoles$.pipe(
      map(roles => {
        if (!roles) return false;
        return permissions.every(perm => roles.includes(perm));
      })
    );
  }

  /**
   * Get current user roles synchronously (for immediate checks)
   * @returns Promise<string[]>
   */
  getCurrentRoles(): Promise<string[]> {
    return new Promise(resolve => {
      this.userRoles$.pipe(
        map(roles => roles || [])
      ).subscribe(roles => resolve(roles));
    });
  }

  /**
   * Check if user can view (has View permission)
   */
  canView(viewPermission: string): Observable<boolean> {
    return this.hasPermission(viewPermission);
  }

  /**
   * Check if user can add (has Add permission)
   */
  canAdd(addPermission: string): Observable<boolean> {
    return this.hasPermission(addPermission);
  }

  /**
   * Check if user can edit (has Edit permission)
   */
  canEdit(editPermission: string): Observable<boolean> {
    return this.hasPermission(editPermission);
  }

  /**
   * Check if user can delete (has Delete permission)
   */
  canDelete(deletePermission: string): Observable<boolean> {
    return this.hasPermission(deletePermission);
  }
}
