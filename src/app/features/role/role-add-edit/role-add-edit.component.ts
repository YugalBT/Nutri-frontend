import { Component, OnInit, OnDestroy, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
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
      roleName: ['', Validators.required],
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



  private loadModules(): void {
    this.modulesLoading = true;
    this.modulesError = null;
    
    const sub = this.commonService.getModules().subscribe({
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
        roleName: roleData.nameEn || roleData.nameIt || '',
        description: roleData.nameIt || ''
      });
      if (this.roleId) {
        this.loadRole(this.roleId);
      }

    } else {
      this.form.reset();
    }
    
    const element = this.roleModal?.nativeElement;
    if (element) {
      this.modalInstance = new (window as any).bootstrap.Modal(element);
      this.modalInstance.show();
    }
  }


  closeModal(): void {
    if (this.modalInstance) {
      this.modalInstance.hide();
    }
    this.form.reset();
    this.roleId = null;
    this.isEditMode = false;
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

  saveRole(): void {
    if (!this.canManageRoles) {
      this.toast.error(this.translate.instant('common.noPermission') || 'You do not have permission');
      return;
    }

    if (!this.form.valid) {
      this.toast.error(this.translate.instant('common.formInvalid') || 'Please fill required fields');
      return;
    }

    this.isLoading = true;
    this.spinner.show();


    const checkedPermissions = this.getCheckedPermissions();

    const payload: any = {
      nameEn: this.form.get('roleName')?.value,
      nameIt: this.form.get('roleName')?.value,
       rolePermissionId: this.getCheckedPermissions() 
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
        const message = this.isEditMode 
          ? this.translate.instant('role.updated') || 'Role updated successfully'
          : this.translate.instant('role.created') || 'Role created successfully';
        this.toast.success(message);
        this.closeModal();

        const savedRole: RoleItem = {
          roleId: response.roleId,
          nameEn: payload.nameEn,
          nameIt: payload.nameIt,
          rolePermissionId: payload.rolePermissionId
        };
        this.roleSaved.emit({ role: null as any, isEdit: this.isEditMode }); 
      },
      error: (err) => {
        this.isLoading = false;
        this.spinner.hide();
        const errMsg = err?.error?.message || this.translate.instant('common.error') || 'Error saving role';
        this.toast.error(errMsg);
      }
    });
    this.subs.push(sub);
  }


  private getCheckedPermissions(): string[] {
  const checkedPerms: string[] = [];
  this.modules.forEach((module: Module) => {
    if (module.permissions) {
      module.permissions.forEach((permission) => {
        const checkbox = document.getElementById(`perm_${permission.permissionId}`) as HTMLInputElement;
        if (checkbox && checkbox.checked) {
          checkedPerms.push(permission.permissionId);
        }
      });
    }
  });
  return checkedPerms;
}


  private loadRole(roleId: string): void {
    const sub = this.roleService.getRoleById(roleId).subscribe({
      next: (res: any) => {
        const data = (res as any)?.data as RoleItem || res as RoleItem;
        if (!data) return;
        this.form.patchValue({
          roleName: data.nameEn || data.nameIt || '',
        });

        this.existingPermissionIds.clear();
        const perms = data.rolePermissionId || [];
        perms.forEach((p: string) => {
          if (p) this.existingPermissionIds.add(p);
        });


        setTimeout(() => {
          this.modules.forEach((module: Module) => {
            module.permissions?.forEach((permission) => {
              const checkbox = document.getElementById(`perm_${permission.permissionId}`) as HTMLInputElement;
              if (checkbox) checkbox.checked = this.existingPermissionIds.has(permission.permissionId);
            });
          });
        }, 20);
      },
      error: (err) => {
        this.toast.error(this.translate.instant('common.error') || 'Error loading role');
      }
    });
    this.subs.push(sub);
  }

 
 

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }
}
