import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, MinLengthValidator, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';

import { ToastService } from '../../../../shared/services/toast.service';
import { ManageTemplateService } from '../../../../core/services/template-builder/manage-template/manage-template.service';
import { CommonService } from '../../../../shared/services/common.service';
import { TemplateList } from '../../../../core/models/template-builder/template-list';
import { TemplatePlaceholderList } from '../../../../core/models/template-builder/template-placeholder-list';
import { TemplateCategoryList } from '../../../../core/models/template-builder/template-category-list';
import { SharedModule } from '../../../../shared/shared.module';
import { TranslatePipe } from '../../../../i18n/translate.pipe';
import { CustomValidators } from '../../../../core/helpers/validators';
import { User } from '../../../../state/auth/auth.models';
import { Store } from '@ngrx/store';
import { selectAuthUser } from '../../../../state/auth/auth.selectors';

declare const bootstrap: any;
declare const CKEDITOR: any;

@Component({
  selector: 'app-template-add-edit',
  standalone: true,
  imports: [SharedModule,ReactiveFormsModule,TranslatePipe],
  templateUrl: './template-add-edit.component.html',
  styleUrl: './template-add-edit.component.css'
})
export class TemplateAddEditComponent
implements AfterViewInit, OnDestroy {

  @ViewChild('templateModal', { static: true })
  templateModal!: ElementRef<HTMLDivElement>;
  form: FormGroup;
  modalInstance: any;
  isEdit = false;
  currentTemplateId: string | null = null;
  isMasterData: boolean = false;
  categories: TemplateCategoryList[] = [];
  placeholders: TemplatePlaceholderList[] = [];
  filteredPlaceholders: TemplatePlaceholderList[] = [];

  subs: Subscription[] = [];
  private categoryChangeSub?: Subscription;
  user$: Observable<User | null>;

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private toast: ToastService,
    private templateService: ManageTemplateService,
    private commonService: CommonService
  ) {
    this.form = this.fb.group({
      categoryId: [
        null,
        [Validators.required]
      ],
      type: [
        null,
        [Validators.required]
      ],
      subject: [
        '',
        [Validators.required, Validators.maxLength(50)]
      ],
      isMasterData: [
        false
      ],
      body: [
        '',
        [Validators.required]
      ]
    });
  this.user$ = this.store.select(selectAuthUser);
  }


  ngOnInit(): void {
    this.loadCategories();
    this.categoryChangeSub = this.form.get('categoryId')?.valueChanges.subscribe(categoryId => {
      debugger;
      if (categoryId) {
        this.loadPlaceholdersByCategory(categoryId);
      } else {
        this.placeholders = [];
        this.filteredPlaceholders = [];
      }
    });

    this.modalInstance = new bootstrap.Modal(
      this.templateModal.nativeElement,
      { backdrop: 'static' }
    );
  }

  ngAfterViewInit(): void {
    CKEDITOR.replace('ng-ckeditor-textarea', {
      height: 300,
      allowedContent: true,
      extraAllowedContent: '*(*);*{*}',
      removePlugins: 'elementspath',
      resize_enabled: false,
      toolbar: [
        { name: 'clipboard', items: ['Undo', 'Redo', '-', 'Cut', 'Copy', 'Paste', 'PasteText', 'PasteFromWord'] },

        { name: 'editing', items: ['Find', 'Replace', '-', 'SelectAll'] },

        { name: 'styles', items: ['Format', 'Font', 'FontSize'] },

        {
          name: 'basicstyles', items: [
            'Bold', 'Italic', 'Underline', 'Strike', '-',
            'Subscript', 'Superscript', '-',
            'RemoveFormat'
          ]
        },

        { name: 'colors', items: ['TextColor', 'BGColor'] },

        {
          name: 'paragraph', items: [
            'NumberedList', 'BulletedList', '-',
            'Outdent', 'Indent', '-',
            'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock'
          ]
        },

        { name: 'links', items: ['Link', 'Unlink', 'Anchor'] },

        {
          name: 'insert', items: [
            'Table', 'Image', 'HorizontalRule', 'SpecialChar'
          ]
        },

        { name: 'tools', items: ['Maximize'] },

        { name: 'document', items: ['Source'] }
      ]

    });

    CKEDITOR.instances['ng-ckeditor-textarea'].on('change', () => {
      this.form.get('body')?.setValue(
        CKEDITOR.instances['ng-ckeditor-textarea'].getData()
      );
    });
  }



  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
    this.categoryChangeSub?.unsubscribe();

    const editor = CKEDITOR.instances['ng-ckeditor-textarea'];
    if (editor) {
      editor.destroy(true);
    }
  }






  /* ---------------- MODAL ---------------- */

  openModal(edit = false, data?: TemplateList): void {
    this.isEdit = edit;
    this.form.reset();
    this.currentTemplateId = null;

    this.modalInstance.show();

    setTimeout(() => {
      const editor = CKEDITOR.instances['ng-ckeditor-textarea'];

      if (edit && data) {
        this.form.patchValue({
          categoryId: data.categoryId,
          type: data.type,
          subject: data.subject,
          isMasterData: data.isMasterData=== true,
          body: data.body
        });

        editor.setData(data.body || '');
        this.currentTemplateId = data.id;
      } else {
        editor.setData('');
      }
    }, 0);
  }


  closeModal(): void {
    this.modalInstance.hide();
  }

  /* ---------------- PLACEHOLDERS ---------------- */

  onPlaceholderSearch(value: string): void {
    this.filteredPlaceholders = this.placeholders.filter(p =>
      p.placeholderValue?.toLowerCase().includes(value.toLowerCase())
    );
  }

  insertPlaceholder(value: string): void {
    const editor = CKEDITOR.instances['ng-ckeditor-textarea'];
    if (editor) {
      editor.insertText(`${value}`);
    }
  }


  /* ---------------- DATA ---------------- */

  private loadCategories(): void {
    const sub = this.commonService.getAlltemplateCategoryList().subscribe({
      next: res => (this.categories = res.data ?? []),
      error: () => this.toast.error('Failed to load categories')
    });
    this.subs.push(sub);
  }

  private loadPlaceholdersByCategory(categoryId: string): void {
    debugger;
    const sub = this.commonService.GetAllPlaceholderByCategoryId(categoryId).subscribe({
      next: res => {
        this.placeholders = res?.data ?? [];
        this.filteredPlaceholders = this.placeholders;
      },
      error: () => {
        this.placeholders = [];
        this.filteredPlaceholders = [];
        this.toast.error('Failed to load placeholders')
      }
    });
    this.subs.push(sub);
  }

  /* ---------------- SAVE ---------------- */

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.warning('Please fill required fields');
      return;
    }

    const payload = {
      ...this.form.value,
      // isAvailableForCompany: true,
    };

    const req$ =
      this.isEdit && this.currentTemplateId
        ? this.templateService.updateTemplate({
          ...payload,
          id: this.currentTemplateId
        })
        : this.templateService.createTemplate(payload);

    const sub = req$.subscribe({
      next: res => {
        res.isSuccess
          ? this.toast.success(res.message)
          : this.toast.error(res.message);
        this.closeModal();
      },
      error: () => this.toast.error('Operation failed')
    });

    this.subs.push(sub);
  }
}
