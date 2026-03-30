import { Injectable } from '@angular/core';
import { PermissionService } from './permission.service';
import { map } from 'rxjs/operators';

/**
 * Utility service to help quickly check permissions in components
 * This is a convenience wrapper around PermissionService for common CRUD operations
 */
@Injectable({
  providedIn: 'root'
})
export class PermissionUtilService {
  constructor(private permissionService: PermissionService) {}

  /**
   * Get all permission flags for a module as an Observable
   * Usage: this.permissionUtil.getModulePermissions('User').subscribe(perms => {
   *   this.canView = perms.view;
   *   this.canAdd = perms.add;
   *   this.canEdit = perms.edit;
   *   this.canDelete = perms.delete;
   * })
   */
  getModulePermissions(module: string) {
    return this.permissionService.userRoles$.pipe(
      map(roles => ({
        view: (roles || []).includes(module + 'View'),
        add: (roles || []).includes(module + 'Add'),
        edit: (roles || []).includes(module + 'Edit'),
        delete: (roles || []).includes(module + 'Delete'),
      }))
    );
  }

  /**
   * Check if user can perform create/edit actions
   * Useful for determining if save button should be shown
   */
  canSave(actionPermission: string): Promise<boolean> {
    return new Promise(resolve => {
      this.permissionService.userRoles$.pipe(
        map(roles => (roles || []).includes(actionPermission))
      ).subscribe(canSave => resolve(canSave));
    });
  }

  /**
   * Check single permission synchronously in template
   * Usage in template: *ngIf="canPhrase(permission)"
   */
  hasPermissionSync(permission: string, roles: string[]): boolean {
    return (roles || []).includes(permission);
  }
}
