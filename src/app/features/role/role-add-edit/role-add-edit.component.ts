import { Component, OnInit, OnDestroy, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subscription, interval, of } from 'rxjs';
import { take, switchMap, filter, first } from 'rxjs/operators';
import { TranslatePipe } from '../../../i18n/translate.pipe';
import { HasPermissionDirective } from '../../../shared/has-permission.directive';
import { TranslateService } from '../../../i18n/translate.service';
import { ToastService } from '../../../shared/services/toast.service';
import { ConfirmDialogService } from '../../../shared/services/confirm-dialog.service';
import { selectCanManageRoles } from '../../../state/auth/auth.selectors';
import { NgxSpinnerService } from 'ngx-spinner';
import { CommonService } from '../../../shared/services/common.service';
import { AddEditRoleService } from '../../../core/services/role/add-edit-role.service';
import { RoleItem, CreateUpdateRolePayload, Module, GetAllModulesResponse } from '../../../core/models/add-edit-role';
import { SharedModule } from '../../../shared/shared.module';

declare var bootstrap: any;

@Component({
  selector: 'app-user-role-addedit',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, TranslatePipe, SharedModule, HasPermissionDirective],
  templateUrl: './role-add-edit.component.html',
  styleUrls: ['./role-add-edit.component.css']
})
export class UserRoleAddEditComponent implements OnInit, OnDestroy {
  @ViewChild('roleModal') roleModal!: ElementRef;
  private modalInstance: any;

  form!: FormGroup;
  isEditMode = false;
  roleId: string | null = null;
  canManageRoles = false;
  isLoading = false;
  modules: Module[] = [];
  modulesLoading = false;
  modulesError: string | null = null;
  isSuperAdmin = false;
  
  // existing permission ids for edit mode
  existingPermissionIds: Set<string> = new Set<string>();
  
  private subs: Subscription[] = [];
 @Output() roleSaved: EventEmitter<{ role: RoleItem, isEdit: boolean }> = new EventEmitter();


  constructor(
    private fb: FormBuilder,
    private store: Store,
    private translate: TranslateService,
    private toast: ToastService,
    private confirm: ConfirmDialogService,
    private spinner: NgxSpinnerService,
    private roleService: AddEditRoleService,
    private commonService: CommonService
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    // Check permission to manage roles
    sessionStorage.getItem('isSuperAdmin') === 'true' ? this.isSuperAdmin = true : this.isSuperAdmin = false;
    const canManageSub = this.store.select(selectCanManageRoles).pipe(take(1)).subscribe((canManage) => {
      if (!canManage) {
        this.toast.error(this.translate.instant('common.noPermission') || 'You do not have permission to manage roles');
        return;
      }
      this.canManageRoles = true;
    });
    this.subs.push(canManageSub);


    this.loadModules();
  }

  private initForm(): void {
    this.form = this.fb.group({
      roleName: ['', [Validators.required,    Validators.pattern(/^[\p{L}_ .'-]+$/u)]],
      roleNameIt: ['',[   Validators.pattern(/^[\p{L}_ .'-]+$/u)]],
      isDefault: [false],
      isShow: [false],
      isEditable: [false],
      description: ['']
    });
  }

  getPerm(perms: any[], type: string) {
  if (!perms) return null;

  type = type.toLowerCase();

  return perms.find(p =>
    p.modulePermissionDisplay?.toLowerCase().includes(type)
  );
}



  private loadModules(masterRoles: boolean = false): void {
    this.modulesLoading = true;
    this.modulesError = null;
    
    const sub = this.commonService.getModules(masterRoles).subscribe({
      next: (response) => {
        const modulesResp = (response as any)?.data as GetAllModulesResponse;
        this.modules = modulesResp?.data || response?.data || (response as any)?.modules || [];
        this.modulesLoading = false;
      },
      error: (err: any) => {
        console.error('Error loading modules:', err);
        this.modulesError = this.translate.instant('common.error') || 'Error loading permissions';
        this.toast.error(this.modulesError);
        this.modulesLoading = false;
      }
    });
    this.subs.push(sub);
  }

 
  openModal(isEdit: boolean, roleData?: RoleItem | undefined): void {
    this.isEditMode = isEdit;
    this.roleId = isEdit && roleData ? roleData.roleId : null;
    
    if (isEdit && roleData) {
      this.form.patchValue({
        roleName: roleData.nameEn || '',
        roleNameIt: roleData.nameIt || '',
        isDefault : roleData.isDefault || false,
        isShow : roleData.isShow || true,
        isEditable : roleData.isEditable || false,
        description: roleData.nameIt || ''
      });
         this.loadModules(roleData.isShow);
      // If modules are already loaded, populate permissions immediately from roleData
      if (this.modules && this.modules.length > 0) {
        this.populatePermissionsFromRole(roleData);
      } else {
        // Wait for modules to finish loading, then populate permissions
        const modulesSub = this.waitForModules().subscribe(() => {
          this.populatePermissionsFromRole(roleData);
        });
        this.subs.push(modulesSub);
      }
    } else {
      this.form.reset();
      this.existingPermissionIds.clear();
    }
    
    const element = this.roleModal?.nativeElement;
    if (element) {
      this.modalInstance = new (window as any).bootstrap.Modal(element);
      this.modalInstance.show();
    }
  }


  private populatePermissionsFromRole(roleData: RoleItem): void {
    if (!roleData) return;
    
    this.existingPermissionIds.clear();
    const perms = roleData.rolePermissionId || [];
    perms.forEach((p: string) => {
      if (p) this.existingPermissionIds.add(p);
    });
  }

  
  private waitForModules(): any {
    if (this.modules && this.modules.length > 0) {
      return of(null);
    }
    

    return interval(50).pipe(
      filter(() => this.modules && this.modules.length > 0),
      first()
    );
  }


  closeModal(): void {
    if (this.modalInstance) {
      this.modalInstance.hide();
    }
    this.form.reset();
    this.roleId = null;
    this.isEditMode = false;
    this.existingPermissionIds.clear();
  }


  isPermissionChecked(permissionId: string): boolean {
    return this.existingPermissionIds.has(permissionId);
  }


  togglePermission(permissionId: string): void {

    if (!permissionId) return;
    if (this.existingPermissionIds.has(permissionId)) {
      this.existingPermissionIds.delete(permissionId);
    } else {
      this.existingPermissionIds.add(permissionId);
    }
    }

  // saveRole(): void {
   
  //   if (!this.canManageRoles) {
  //     this.toast.error(this.translate.instant('common.noPermission') || 'You do not have permission');
  //     return;
  //   }

  //   if (!this.form.valid) {
  //     this.toast.error(this.translate.instant('common.formInvalid') || 'Please fill required fields');
  //     return;
  //   }

  //   this.isLoading = true;
  //   this.spinner.show();


  //   const checkedPermissions = this.getCheckedPermissions();

  //   const payload: CreateUpdateRolePayload = {
  //     nameEn: this.form.get('roleName')?.value,
  //     nameIt: this.form.get('description')?.value || this.form.get('roleName')?.value,
  //     rolePermissionId: checkedPermissions || []

  //   };
  //    console.log('Saving role...',payload);
  //   if (this.isEditMode && this.roleId) {
  //     payload.roleId = this.roleId;
  //   }

  //   const apiCall$ = this.isEditMode && this.roleId
  //     ? this.roleService.updateRole(payload)
  //     : this.roleService.createRole(payload);

  //   const sub = apiCall$.subscribe({
  //     next: (response: any) => {
  //       this.isLoading = false;
  //       this.spinner.hide();
  //       const message = this.isEditMode
  //         ? this.translate.instant('role.updated') || 'Role updated successfully'
  //         : this.translate.instant('role.created') || 'Role created successfully';
  //       this.toast.success(message);
  //       this.closeModal();
  //       // extract actual role data from response
  //       const respData = (response as any)?.data || response;
  //       const savedRole: RoleItem = {
  //         roleId: respData?.roleId || respData?.roleId || this.roleId || '',
  //         nameEn: payload.nameEn,
  //         nameIt: payload.nameIt,
  //         rolePermissionId: payload.rolePermissionId || []
  //       };
  //       this.roleSaved.emit({ role: savedRole, isEdit: this.isEditMode });
  //     },
  //     error: (err) => {
  //       this.isLoading = false;
  //       this.spinner.hide();
  //       const errMsg = err?.error?.message || this.translate.instant('common.error') || 'Error saving role';
  //       this.toast.error(errMsg);
  //     }
  //   });
  //   this.subs.push(sub);
  // }

  saveRole(): void {

  if (!this.canManageRoles) {
    this.toast.error(this.translate.instant('common.noPermission') || 'You do not have permission');
    return;
  }

  if (this.form.invalid) {
    this.toast.error(this.translate.instant('common.formInvalid') || 'Please fill required fields');
    return;
  }

  this.isLoading = true;
  this.spinner.show();

  const checkedPermissions = this.getCheckedPermissions();

  const payload: CreateUpdateRolePayload = {
    nameEn: this.form.get('roleName')?.value,
    nameIt: this.form.get('roleNameIt')?.value || null,
    isDefault: this.form.get('isDefault')?.value || false,
    isShow: this.form.get('isShow')?.value || true,
    isEditable: this.form.get('isEditable')?.value || false,
    rolePermissionId: checkedPermissions || []
  };

  if (this.isEditMode && this.roleId) {
    payload.roleId = this.roleId;
  }

  const apiCall$ = this.isEditMode && this.roleId
    ? this.roleService.updateRole(payload)
    : this.roleService.createRole(payload);

  const sub = apiCall$.subscribe({
    next: (response: any) => {
      this.isLoading = false;
      this.spinner.hide();

      const resp = response?.data || response;
    
      if (response?.isSuccess === false) {
        const msg =
          response?.message ||
          this.translate.instant('common.error') ||
          'Something went wrong';

        this.toast.error(msg);
        return;
      }

      const message = this.isEditMode
        ? this.translate.instant('role.updated') || 'Role updated successfully'
        : this.translate.instant('role.created') || 'Role created successfully';

      this.toast.success(message);

      this.closeModal();

  
      const savedRole: RoleItem = {
        roleId: resp?.roleId || payload.roleId || '',
        nameEn: payload.nameEn,
        rolePermissionId: payload.rolePermissionId || []
      };

      this.roleSaved.emit({ role: savedRole, isEdit: this.isEditMode });
    },

    error: (err) => {
      this.isLoading = false;
      this.spinner.hide();

      let errMsg: string = this.translate.instant('common.error') || 'Error saving role';

      if (err?.error?.errors) {
        const allErrors = Object.values(err.error.errors).flat();
        errMsg = String(allErrors[0]) || errMsg;
      }
      else if (err?.error?.message) {
        errMsg = String(err.error.message);
      }
      else if (typeof err?.message === 'string') {
        errMsg = err.message;
      }

      this.toast.error(errMsg);
    }
  });

  this.subs.push(sub);
}


  private getCheckedPermissions(): string[] {
    return Array.from(this.existingPermissionIds);
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }
}
