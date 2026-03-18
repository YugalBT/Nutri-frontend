import { Component, ElementRef, ViewChild } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '../../../../i18n/translate.pipe';
import { Subscription } from 'rxjs';
import { ToastService } from '../../../../shared/services/toast.service';
import { CommonService } from '../../../../shared/services/common.service';
import { ManageCategoryService } from '../../../../core/services/template-builder/manage-category/manage-category.service';
import { TemplateCategoryList } from '../../../../core/models/template-builder/template-category-list';

declare var bootstrap: any;
@Component({
  selector: 'app-template-category-add-edit',
  standalone: true,
  imports: [SharedModule,ReactiveFormsModule,TranslatePipe],
  templateUrl: './template-category-add-edit.component.html',
  styleUrl: './template-category-add-edit.component.css'
})
export class TemplateCategoryAddEditComponent {

   @ViewChild('templatecategoryModal', { static: true }) templatecategoryModal!: ElementRef;
  form!: FormGroup;
  modalInstance: any;

  isEdit = false;
  currentcategoryId: string | null = null;

  subs: Subscription[] = [];
  isAddEditPermission = false;
  constructor(
    private fb: FormBuilder,
    private toast: ToastService,
    private commonService: CommonService,
    private templateCategory :ManageCategoryService
  ) {}

  ngOnInit() {
    
    this.initializeForm();
    this.modalInstance = new bootstrap.Modal(this.templatecategoryModal.nativeElement, { backdrop: 'static' });
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
  }

  private initializeForm() {
    this.form = this.fb.group({
      category: ['', [Validators.required,Validators.minLength(3),Validators.maxLength(20), Validators.pattern(/^[A-Za-z\s]+$/)]],
      displayName: ['', [Validators.minLength(3),Validators.maxLength(20), Validators.pattern(/^[A-Za-z\s]+$/)]],
    });
  }

  openModal(edit = false, data?: TemplateCategoryList) {
    this.isEdit = edit;
    this.form.reset();
     this.currentcategoryId = null;

    //  this.isAddEditPermission = this.isEdit
    //   ? this.commonService.checkPermission(PERMISSIONS.AnimalLactationEdit)
    //   : this.commonService.checkPermission(PERMISSIONS.AnimalLactationAdd);

    if (edit && data) {
      this.form.patchValue({
        category: data.category,
        displayName: data.displayName
      });
      this.currentcategoryId = data.categoryId ?? null;
    } else {
      this.currentcategoryId = null;
    }

    this.modalInstance.show();
  }

  closeModal() {
    this.modalInstance?.hide();
  }

  save() {
    // const hasPermission = this.isEdit
    //   ? this.commonService.checkPermission(PERMISSIONS.AnimalLactationEdit)
    //   : this.commonService.checkPermission(PERMISSIONS.AnimalLactationAdd);

    // if (!hasPermission) {
    //   this.toast.error('You do not have permission to perform this action.');
    //   return;
    // }

    // if(!this.isAddEditPermission){
    //   this.toast.error('You do not have permission');
    //   return;
    // }
    if (!this.form.valid) {
      this.toast.warning('Please fill all required fields');
      this.form.markAllAsTouched();
      return;
    }

    const payload: any = { ...this.form.value };

    if (this.isEdit && this.currentcategoryId) {
      payload.categoryId = this.currentcategoryId;
      const sub = this.templateCategory.updateTemplateCategory(payload).subscribe(res => {
        if (res.isSuccess) {
          this.toast.success(res.message);
          this.closeModal();
          this.templateCategory.templateCategoriesChanged;
        } else {
          this.toast.error(res.message);
        }
      }, err => this.toast.error(err?.message));
      this.subs.push(sub);
    } else {
      const sub = this.templateCategory.createTemplateCategory(payload).subscribe(res => {
        if (res.isSuccess) {
          this.toast.success(res.message);
          this.closeModal();
          this.templateCategory.templateCategoriesChanged$;
        } else {
          this.toast.error(res.message);
        }
      }, err => this.toast.error(err?.message));
      this.subs.push(sub);
    }
  }

}
