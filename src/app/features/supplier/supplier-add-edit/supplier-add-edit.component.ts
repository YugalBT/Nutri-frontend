import {
  Component,
  ElementRef,
  ViewChild,
  OnDestroy,
  OnInit,
  Output,
  EventEmitter
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { debounceTime, Subscription } from 'rxjs';
import { SupplierService } from '../../../core/services/supplier/supplier.service';
import { ToastService } from '../../../shared/services/toast.service';
import { SharedModule } from '../../../shared/shared.module';
import { TranslatePipe } from '../../../i18n/translate.pipe';
import { CommonService } from '../../../shared/services/common.service';
import { RoleList } from '../../../core/models/rolelist';
import { TranslateService } from '../../../i18n/translate.service';

declare var bootstrap: any;

@Component({
  selector: 'app-supplier-add-edit',
  standalone: true,
  imports: [SharedModule, TranslatePipe],
  templateUrl: './supplier-add-edit.component.html',
  styleUrls: ['./supplier-add-edit.component.css']
})
export class SupplierAddEditComponent implements OnInit, OnDestroy {

  @ViewChild('supplierModal') supplierModal!: ElementRef;

  form!: FormGroup;
  modalInstance: any;
  isEdit = false;
  currentId: string | null = null;
  subs: Subscription[] = [];
  showCurrent = false;
  roles: RoleList[] = [];
  rolesLoading = false;
  rolesError: string | null = null;

  @Output() onSupplierSaved = new EventEmitter<void>();

  constructor(
    private fb: FormBuilder,
    private supplierService: SupplierService,
    private toast: ToastService,
    private commonService: CommonService
  ) { }

  ngOnInit() {
    this.initializeForm();
    this.listenToFirstNameChange();
  }

  private initializeForm() {

    this.form = this.fb.group({

      supplierCode: [{ value: '', disabled: true }, [
        Validators.required,
        Validators.maxLength(50)
      ]],

      firstName: ['', [
        Validators.required,
        Validators.maxLength(50),
        Validators.pattern(/^[A-Za-z*]+$/)
      ]],

      lastName: ['', [
        Validators.required,
        Validators.maxLength(50),
        Validators.pattern(/^[A-Za-z*]+$/)
      ]],

      emailAddress: ['', [
        Validators.required,
        Validators.maxLength(100),
        Validators.email
      ]],

      phoneNumber: ['', [
        Validators.required,
        Validators.minLength(7),
        Validators.maxLength(15),
        Validators.pattern(/^\d+$/)
      ]],

      streetAddress: ['', [
        Validators.required,
        Validators.maxLength(100)
      ]],

      state: ['', [
        Validators.required,
        Validators.maxLength(100)
      ]],

      city: ['', [
        Validators.required,
        Validators.maxLength(100)
      ]],

      zipCode: ['', [
        Validators.required,
        Validators.pattern(/^\d{5,6}$/)
      ]],
      password: ['', [
        Validators.required,
        Validators.maxLength(100),
      ]],
    });
  }

private listenToFirstNameChange() {

  const debounceDelay = 300; 

  this.form.get('firstName')?.valueChanges
    .pipe(debounceTime(debounceDelay))
    .subscribe(value => {

      if (!value || value.length < 2) {
        this.form.patchValue({ supplierCode: '' });
        return;
      }

      this.generateSupplierCode(value);
    });
}



  generateSupplierCode(firstName: string) {
    if (!firstName || firstName.length < 2) {
      this.form.patchValue({ supplierCode: '' });
      return;
    }

    const sub = this.supplierService.generateSupplierCode(firstName)
      .subscribe(res => {

        if (res.isSuccess) {
          this.form.patchValue({
            supplierCode: res.data
          });
        } else {
          this.toast.error(res.message);
        }
      });

    this.subs.push(sub);
  }

  openModal(edit = false, data?: any) {

    this.isEdit = edit;
    this.form.reset();

    if (edit && data) {
      this.form.patchValue(data);
      this.currentId = data.supplierId;
    } else {
      this.currentId = null;
    }
    this.form.get('password')?.clearValidators();
    this.form.get('password')?.updateValueAndValidity();
    this.modalInstance = new bootstrap.Modal(this.supplierModal.nativeElement);
    this.modalInstance.show();
  }

  saveSupplier() {

    if (!this.form.valid) {
      this.form.markAllAsTouched();
      this.toast.warning("Please fix validation errors");
      return;
    }

    const payload = {
      ...this.form.getRawValue()
    };

    if (this.isEdit && this.currentId) {
      payload.supplierId = this.currentId;

      const sub = this.supplierService.updateSupplier(payload)
        .subscribe(res => {
          if (res.isSuccess) {
            this.toast.success(res.message);
            this.supplierService.notifySuppliersChanged();
            this.closeModal();
          } else {
            this.toast.error(res.message);
          }
        });

      this.subs.push(sub);

    } else {

      const sub = this.supplierService.createSupplier(payload)
        .subscribe(res => {
          if (res.isSuccess) {
            this.toast.success(res.message);
            this.supplierService.notifySuppliersChanged();
            this.closeModal();
          } else {
            this.toast.error(res.message);
          }
        });

      this.subs.push(sub);
    }
  }

  closeModal() {
    this.modalInstance?.hide();
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
  }
}
