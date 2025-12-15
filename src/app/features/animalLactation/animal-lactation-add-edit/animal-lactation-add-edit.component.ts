import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ToastService } from '../../../shared/services/toast.service';
import { AnimallactationService } from '../../../core/services/animallactation/animallactation.service';
import { SharedModule } from '../../../shared/shared.module';
import { AnimallactationList } from '../../../core/models/animallactation-list';
import { CommonService } from '../../../shared/services/common.service';
import { PERMISSIONS } from '../../../core/constants/permissions.constants';

declare var bootstrap: any;

@Component({
  selector: 'app-animal-lactation-add-edit',
  standalone: true,
  imports: [SharedModule, ReactiveFormsModule],
  templateUrl: './animal-lactation-add-edit.component.html',
  styleUrls: ['./animal-lactation-add-edit.component.css']
})
export class AnimalLactationAddEditComponent {

  @ViewChild('animalLactationModal', { static: true }) animalLactationModal!: ElementRef;
  form!: FormGroup;
  modalInstance: any;

  isEdit = false;
  currentAnimallactationId: string | null = null;

  subs: Subscription[] = [];
  isAddEditPermission = false;
  constructor(
    private fb: FormBuilder,
    private toast: ToastService,
    private animallactationService: AnimallactationService,
    private commonService: CommonService
  ) {}

  ngOnInit() {
    
    this.initializeForm();
    this.modalInstance = new bootstrap.Modal(this.animalLactationModal.nativeElement, { backdrop: 'static' });
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
  }

  private initializeForm() {
    this.form = this.fb.group({
      lactationNameEn: ['', [Validators.required,Validators.min(3),Validators.max(20), Validators.pattern(/^[A-Za-z\s]+$/)]],
      lactationNameIt: ['', [Validators.min(3),Validators.max(20), Validators.pattern(/^[A-Za-z\s]+$/)]],
    });
  }

  openModal(edit = false, data?: AnimallactationList) {
    this.isEdit = edit;
    this.form.reset();
     this.currentAnimallactationId = null;

     this.isAddEditPermission = this.isEdit
      ? this.commonService.checkPermission(PERMISSIONS.AnimalLactationEdit)
      : this.commonService.checkPermission(PERMISSIONS.AnimalLactationAdd);

    if (edit && data) {
      this.form.patchValue({
        lactationNameEn: data.lactationNameEn,
        lactationNameIt: data.lactationNameIt
      });
      this.currentAnimallactationId = data.animalLactationId ?? null;
    } else {
      this.currentAnimallactationId = null;
    }

    this.modalInstance.show();
  }

  closeModal() {
    this.modalInstance?.hide();
  }

  save() {
    const hasPermission = this.isEdit
      ? this.commonService.checkPermission(PERMISSIONS.AnimalLactationEdit)
      : this.commonService.checkPermission(PERMISSIONS.AnimalLactationAdd);

    if (!hasPermission) {
      this.toast.error('You do not have permission to perform this action.');
      return;
    }

    if(!this.isAddEditPermission){
      this.toast.error('You do not have permission');
      return;
    }
    if (!this.form.valid) {
      this.toast.warning('Please fill all required fields');
      this.form.markAllAsTouched();
      return;
    }

    const payload: any = { ...this.form.value };

    if (this.isEdit && this.currentAnimallactationId) {
      payload.animalLactationId = this.currentAnimallactationId;
      const sub = this.animallactationService.updateAnimalLactation(payload).subscribe(res => {
        if (res.isSuccess) {
          this.toast.success(res.message);
          this.closeModal();
          this.animallactationService.notifyanimalLactationsChanged;
        } else {
          this.toast.error(res.message);
        }
      }, err => this.toast.error(err?.message));
      this.subs.push(sub);
    } else {
      const sub = this.animallactationService.createaAnimalLactation(payload).subscribe(res => {
        if (res.isSuccess) {
          this.toast.success(res.message);
          this.closeModal();
          this.animallactationService.animalLactationsChanged$;
        } else {
          this.toast.error(res.message);
        }
      }, err => this.toast.error(err?.message));
      this.subs.push(sub);
    }
  }
}
