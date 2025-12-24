import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastService } from '../../../shared/services/toast.service';
import { AnimaltypeService } from '../../../core/services/animaltype/animaltype.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonService } from '../../../shared/services/common.service';
import { PERMISSIONS } from '../../../core/constants/permissions.constants';
import { TranslatePipe } from '../../../i18n/translate.pipe';

declare var bootstrap: any;
@Component({
  selector: 'app-animal-type-add-edit',
  standalone: true,
  imports: [ CommonModule,
    ReactiveFormsModule,TranslatePipe],
  templateUrl: './animal-type-add-edit.component.html',
  styleUrl: './animal-type-add-edit.component.css'
})
export class AnimalTypeAddEditComponent implements OnInit{

  @ViewChild('animalTypeModal') animalTypeModal!: ElementRef;
  private modalInstance: any;

  form!: FormGroup;
  isEdit = false;

    constructor(
    private fb: FormBuilder,
    private animalTypeService: AnimaltypeService,
    private toast: ToastService,
    private commonService : CommonService
  ) {}
  
    ngOnInit(): void {

    if(!this.commonService.checkPermission(PERMISSIONS.AnimalTypeAdd)|| !this.commonService.checkPermission(PERMISSIONS.AnimalTypeEdit))
      return;
    this.form = this.fb.group({
      typeNameIt: ['', 
        [Validators.minLength(3),Validators.maxLength(20),
        Validators.pattern(/^[A-Za-z]+$/)]],
      typeNameEn: ['', 
        [Validators.required, Validators.minLength(3),Validators.maxLength(20),
           Validators.pattern(/^[A-Za-z]+$/)]],
      animalTypeId: [''] 
    });
  }
  
    
  openModal(edit = false, data?: any) {
    this.isEdit = edit;

    if (edit && data) {
      this.form.patchValue(data);
    } else {
      this.form.reset();
    }

    this.modalInstance = new bootstrap.Modal(this.animalTypeModal.nativeElement);
    this.modalInstance.show();
  }

  closeModal() {
    if (this.modalInstance) this.modalInstance.hide();
  }

   save() {
    if(!this.commonService.checkPermission(PERMISSIONS.AnimalTypeAdd)|| !this.commonService.checkPermission(PERMISSIONS.AnimalTypeEdit))
      return;
    
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.form.value;

    if (this.isEdit) {
      this.updateAnimalType(payload);
    } else {
     this.createAnimalType(payload);
    }
  }

   private createAnimalType(payload: any) {
    this.animalTypeService.createAnimalType(payload).subscribe({
      next: (res: any) => {
        if (res?.isSuccess) {
          this.toast.success(res.message || "Animal type created successfully!");
          this.closeModal();
          this.animalTypeService.notifyChanges();
        } else {
          this.toast.error(res.message || "Creation failed");
        }
      },
      error: () => this.toast.error("Something went wrong")
    });
  }

  private updateAnimalType(payload: any) {
    this.animalTypeService.updateAnimalType(payload).subscribe({
      next: (res: any) => {
        if (res?.isSuccess) {
          this.toast.success(res.message || "Animal type updated successfully!");
          this.closeModal();
          this.animalTypeService.notifyChanges();
        } else {
          this.toast.error(res.message || "Update failed");
        }
      },
      error: () => this.toast.error("Something went wrong")
    });
  }
}
