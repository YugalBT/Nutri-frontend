import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonService } from '../../../shared/services/common.service';
import { FarmService } from '../../../core/services/farm/farm.service';
import { ToastService } from '../../../shared/services/toast.service';
import { Subscription } from 'rxjs';
import { TranslateService } from '../../../i18n/translate.service';
import { SharedModule } from '../../../shared/shared.module';
import { TranslatePipe } from '../../../i18n/translate.pipe';

declare var bootstrap: any;


@Component({
  selector: 'app-farm-add-edit',
  standalone: true,
  imports: [SharedModule, TranslatePipe],
  templateUrl: './farm-add-edit.component.html',
  styleUrl: './farm-add-edit.component.css'
})
export class FarmAddEditComponent {

  @ViewChild('farmModal') farmModal!: ElementRef; 
  private modalInstance: any;
  form!: FormGroup;
  isEdit = false;
  showCurrent = false;

  rolesLoading = false;
  rolesError: string | null = null;
  private currentUserId: string | null = null;
  private subs: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private commonService: CommonService,
    private farmService: FarmService,
    private toast: ToastService,
    private translate: TranslateService
  ) { }

  ngOnInit() {
    this.initializeForm();
  }



  private initializeForm() {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.pattern(/^[A-Za-z]+$/)]],
      middleName: ['', [Validators.pattern(/^[A-Za-z]+$/)]],
      lastName: ['', [Validators.required, Validators.pattern(/^[A-Za-z]+$/)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.pattern(/^[0-9]+$/), Validators.minLength(10), Validators.maxLength(10),
      Validators.required]],
      roleId: [null, Validators.required],
      password: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/)]],
      isActive: [true]
    });
  }



  openModal(edit = false, data?: any) {
    this.isEdit = edit;
    this.form.reset({ isActive: true });

    if (edit && data) {
      this.form.patchValue({
        name: data.firstName,
        middleName: data.middleName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        roleId: data.roleId,
        isActive: data.isActive
      });
      this.currentUserId = data.userId;
      this.form.get('password')?.clearValidators();
      this.form.get('password')?.updateValueAndValidity();
    } else {
      this.currentUserId = null;

    }

    this.modalInstance = new bootstrap.Modal(this.farmModal.nativeElement);
    this.modalInstance.show();
  }

  closeModal() {
    if (this.modalInstance) {
      this.modalInstance.hide();
    }
  }

  saveFarm() {
    if (!this.form.valid) {
      const payload = this.form.getRawValue();
      delete payload.password;
      this.toast.warning('Please fill all required fields');
      return;
    }

    const v = this.form.value;
    const payload: any = {
      firstName: v.name,
      middleName: v.middleName,
      lastName: v.lastName,
      email: v.email,
      phone: v.phone,
      roleId: v.roleId,
      password: v.password
    };

    if (this.isEdit && this.currentUserId) {
      payload.userId = this.currentUserId;

      const sub = this.farmService.updateFarms(payload).subscribe(res => {
        if (res.isSuccess) {
          this.toast.success(res.message);
        } else {
          this.toast.error(res.message);
        }
      });
      this.subs.push(sub);

    } else {
      const sub = this.farmService.createFarms(payload).subscribe(res => {
        if (res?.isSuccess) {
          this.toast.success(res.message);
         
        } else {
          this.toast.error(res.message);
        }
      });
      this.subs.push(sub);
    }
  }


  
}
