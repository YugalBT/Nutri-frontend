import { Component, ElementRef, ViewChild, OnDestroy, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CommonService } from '../../../shared/services/common.service';
import { FarmService } from '../../../core/services/farm/farm.service';
import { ToastService } from '../../../shared/services/toast.service';
import { SharedModule } from '../../../shared/shared.module';
import { TranslatePipe } from '../../../i18n/translate.pipe';
import { CustomValidators } from '../../../core/helpers/validators';
import { PERMISSIONS } from '../../../core/constants/permissions.constants';
import { TranslateService } from '../../../i18n/translate.service';

declare var bootstrap: any;

@Component({
  selector: 'app-farm-add-edit',
  standalone: true,
  imports: [SharedModule, TranslatePipe],
  templateUrl: './farm-add-edit.component.html',
  styleUrls: ['./farm-add-edit.component.css']
})
export class FarmAddEditComponent implements OnInit, OnDestroy {

  @ViewChild('farmModal') farmModal!: ElementRef; 
  form!: FormGroup;
  modalInstance: any;
  isEdit = false;
  canSave = false;
  currentFarmId: string | null = null;
  subs: Subscription[] = [];
  @Output() onFarmSaved = new EventEmitter<void>()

  constructor(
    private fb: FormBuilder,
    private farmService: FarmService,
    private toast: ToastService,
    private commonService: CommonService,
    private transalate : TranslateService
  ) {}

  ngOnInit() {
    this.initializeForm();
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
  }

  private initializeForm() {
  this.form = this.fb.group({
    clientId: [null],

    farmName: [
      '',
      [Validators.required, Validators.pattern(/^[A-Za-z ]+$/)]
    ],

    country: [
      '',
      [
        Validators.required,
        CustomValidators.maxDigits(20),
        Validators.pattern(/^[A-Za-z ]+$/)
      ]
    ],

    milkPrice: [
      '',
      [
        Validators.required,
        Validators.pattern(/^[0-9]+(\.[0-9]+)?$/)
      ]
    ],

    state: [
      '',
      [Validators.required, Validators.pattern(/^[A-Za-z ]+$/)]
    ],

    city: [
      '',
      [Validators.required, Validators.pattern(/^[A-Za-z]+$/)]
    ],

    streetAddress: [
      '',
      [Validators.required, Validators.maxLength(20)] 
    ],

    zipCode: [
      '',
      [
        CustomValidators.required(),
        CustomValidators.onlyNumbers(),
        CustomValidators.minLength(5),
        CustomValidators.maxLength(6)
      ]
    ]
  });
}


  openModal(edit = false, data?: any) {
    this.isEdit = edit;
    this.canSave = edit
      ? this.commonService.checkPermission(PERMISSIONS.FarmEdit, false)
      : this.commonService.checkPermission(PERMISSIONS.FarmAdd, false);

    if (!this.canSave) {
      this.toast.error(this.transalate.instant('common.noPermission') || 'No permission');
      return;
    }

    this.form.reset({ isActive: true });

    if (edit && data) {
      this.form.patchValue({
        clientId: data.clientId,
        farmName: data.farmName,
     //   town: data.town,
        country: data.country,
        isActive: data.isActive,
        milkPrice : data.milkPrice,
        state : data.state,
        city : data.city,
        streetAddress:data.streetAddress,
        zipCode: data.zipCode
      });
      this.currentFarmId = data.farmId;
    } else {
      this.currentFarmId = null;
    }

    this.modalInstance = new bootstrap.Modal(this.farmModal.nativeElement);
    this.modalInstance.show();
  }

  closeModal() {
    this.modalInstance?.hide();
  }

  saveFarm() {
    const hasPermission = this.isEdit
      ? this.commonService.checkPermission(PERMISSIONS.FarmEdit)
      : this.commonService.checkPermission(PERMISSIONS.FarmAdd);

    if(!hasPermission) return;
    if (!this.form.valid) {
      
      this.toast.warning(this.transalate.instant('common.formInvalid') || 'Please fill all required fields');
      return;
    }

    const payload = this.form.value;

    if (this.isEdit && this.currentFarmId) {
      payload.farmId = this.currentFarmId;
      const sub = this.farmService.updateFarms(payload).subscribe(res => {
        if (res.isSuccess) {
          this.toast.success(res.message);
          this.afterSuccess();
          this.closeModal();
          this.onFarmSaved.emit();
        } else {
          this.toast.error(res.message);
        }
      });
      this.subs.push(sub);
    } else {
      const sub = this.farmService.createFarms(payload).subscribe(res => {
        if (res.isSuccess) {
          this.toast.success(res.message);
           this.afterSuccess();
          this.closeModal();
        } else {
          this.toast.error(res.message);
        }
      });
      this.subs.push(sub);
    }
  }

  private afterSuccess() {
    this.farmService.notifyfarmsChanged();
  }
}
