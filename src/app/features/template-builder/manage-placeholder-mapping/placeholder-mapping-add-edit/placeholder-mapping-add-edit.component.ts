import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastService } from '../../../../shared/services/toast.service';
import { CommonService } from '../../../../shared/services/common.service';
import { PlaceholderMappingService } from '../../../../core/services/template-builder/manage-placeholder-mapping/placeholder-mapping.service';
import { TemplateCategoryList } from '../../../../core/models/template-builder/template-category-list';
import { TemplatePlaceholderList } from '../../../../core/models/template-builder/template-placeholder-list';
import { SharedModule } from '../../../../shared/shared.module';
import { TranslatePipe } from '../../../../i18n/translate.pipe';

declare var bootstrap: any;

@Component({
  selector: 'app-placeholder-mapping-add-edit',
  standalone: true,
  imports: [SharedModule, TranslatePipe, ReactiveFormsModule, FormsModule],
  templateUrl: './placeholder-mapping-add-edit.component.html',
  styleUrl: './placeholder-mapping-add-edit.component.css'
})
export class PlaceholderMappingAddEditComponent {

  @ViewChild('mappingModal', { static: true }) mappingModal!: ElementRef;

  form!: FormGroup;
  modal: any;
  isEdit = false;
  currentId: string | null = null;

  categories: TemplateCategoryList[] = [];
  placeholders: TemplatePlaceholderList[] = [];
  filteredPlaceholderList: TemplatePlaceholderList[] = [];

  showDropdown = false;
  searchPlaceholder = '';

  constructor(
    private fb: FormBuilder,
    private toast: ToastService,
    private commonService: CommonService,
    private mappingService: PlaceholderMappingService
  ) { }

  ngOnInit() {
    this.form = this.fb.group({
      categoryId: [null, Validators.required],
      placeholderIds: this.fb.array([], Validators.required),
      searchPlaceholder: [''] 
    });

    this.loadDropdowns();
    this.modal = new bootstrap.Modal(this.mappingModal.nativeElement, { backdrop: 'static' });
  }

  get placeholderIds(): FormArray {
    return this.form.get('placeholderIds') as FormArray;
  }

  loadDropdowns() {
    this.commonService.getAlltemplateCategoryList()
      .subscribe(res => this.categories = Array.isArray(res?.data) ? res.data : []);

    this.commonService.getAlltemplatePlaceholderList()
      .subscribe(res => this.placeholders = Array.isArray(res?.data) ? res.data : []);
  }

  openModal(edit = false, data?: any) {
    this.isEdit = edit;
    this.form.reset();
    this.placeholderIds.clear();
    this.currentId = null;

    if (edit && data) {
      this.form.patchValue({ categoryId: data.categoryId });

      data.placeholders?.forEach((p: any) => {
        if (p.placeholderId) {
          this.placeholderIds.push(this.fb.control(p.placeholderId));
        }
      });

      this.currentId = data.id;
    }

    this.showDropdown = false;
    this.searchPlaceholder = '';
    this.modal.show();
  }

 toggleDropdown() {
  this.showDropdown = !this.showDropdown;

  if (this.showDropdown) {
    this.filteredPlaceholderList = [...this.placeholders];
  }
}
onSearchPlaceholder() {
  const term = this.searchPlaceholder?.trim().toLowerCase();

  if (!term) {
    this.filteredPlaceholderList = [...this.placeholders];
    return;
  }

  this.filteredPlaceholderList = this.placeholders.filter(p =>
    p.placeholderValue?.toLowerCase().includes(term)
  );
}



// filteredPlaceholders(): TemplatePlaceholderList[] {
//   debugger;
//   const term = this.form.value.searchPlaceholder?.trim().toLowerCase();
//   if (!term) return this.placeholders;

//   return this.placeholders.filter(p =>
//     p.placeholderValue?.toLowerCase().includes(term)
//   );
// }

confirmSelection() {
  this.showDropdown = false;
}


  togglePlaceholder(id: string, checked: boolean) {
    if (checked && !this.placeholderIds.value.includes(id)) {
      this.placeholderIds.push(this.fb.control(id));
    }

    if (!checked) {
      const index = this.placeholderIds.controls.findIndex(c => c.value === id);
      if (index > -1) this.placeholderIds.removeAt(index);
    }
  }

  removeChip(id: string) {
    const index = this.placeholderIds.controls.findIndex(c => c.value === id);
    if (index > -1) this.placeholderIds.removeAt(index);
  }

  getPlaceholderName(id: string): string {
    return this.placeholders.find(p => p.id === id)?.placeholderValue ?? '';
  }

  closeModal() {
    this.modal.hide();
  }
  onCheckboxChange(id: string, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    this.togglePlaceholder(id, checked);
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.warning('Please fill all required fields');
      return;
    }

    const payload: any = {
      placeholderMappings: [{
        categoryId: this.form.value.categoryId,
        placeholderIds: this.form.value.placeholderIds
      }]
    };

    if (this.isEdit && this.currentId) {
      payload.id = this.currentId;
      this.mappingService.updatePlaceholderMapping(payload).subscribe(res => {
        res.isSuccess ? this.toast.success(res.message) : this.toast.error(res.message);
        this.closeModal();
      });
    } else {
      this.mappingService.createPlaceholderMapping(payload).subscribe(res => {
        res.isSuccess ? this.toast.success(res.message) : this.toast.error(res.message);
        this.closeModal();
      });
    }
  }
}
