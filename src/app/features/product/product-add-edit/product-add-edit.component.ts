import {
  Component,
  ElementRef,
  ViewChild,
  OnInit,
  OnDestroy,
  EventEmitter,
  Output
} from '@angular/core';

import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';

import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subscription } from 'rxjs';

import { ProductService } from '../../../core/services/product/product.service';
import { ToastService } from '../../../shared/services/toast.service';
import { SharedModule } from '../../../shared/shared.module';
import { TranslatePipe } from '../../../i18n/translate.pipe';
import { CommonService } from '../../../shared/services/common.service';
import { PERMISSIONS } from '../../../core/constants/permissions.constants';

declare var bootstrap: any;

@Component({
  selector: 'app-product-add-edit',
  standalone: true,
  imports: [SharedModule, TranslatePipe, ReactiveFormsModule],
  templateUrl: './product-add-edit.component.html',
  styleUrls: ['./product-add-edit.component.css']
})
export class ProductAddEditComponent implements OnInit, OnDestroy {

  @ViewChild('productModal', { static: false })productModal!: ElementRef;

  form!: FormGroup;

  modalInstance: any;

  isEdit = false;
  canSave = false;

  currentId: string | null = null;

  private subs: Subscription[] = [];

  private codeDebounce: any;

  @Output() onProductSaved = new EventEmitter<void>();


  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private toast: ToastService,
    private commonService: CommonService
  ) {}



  ngOnInit() {

    this.form = this.fb.group({

      productName: ['', Validators.required],

      productCode: [{ value: '', disabled: true }],

      effectiveDate: ['', Validators.required]

    });

    this.listenProductNameChange();

  }



  listenProductNameChange() {

    this.form.get('productName')?.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe(value => {

        if (this.isEdit) return;

        if (!value || value.length < 2) {

          this.form.patchValue(
            { productCode: '' },
            { emitEvent: false }
          );

          return;
        }

        this.generateProductCode(value);

      });

  }



  generateProductCode(productName: string) {

    if (this.codeDebounce) clearTimeout(this.codeDebounce);

    this.codeDebounce = setTimeout(() => {

      const sub = this.productService
        .generateProductCode(productName)
        .subscribe(res => {

          if (res?.isSuccess) {

            this.form.patchValue(
              { productCode: res.data },
              { emitEvent: false }
            );

          } else {

            this.toast.error(res.message);

          }

        });

      this.subs.push(sub);

    }, 400);

  }



  openModal(edit = false, data?: any) {

    this.isEdit = edit;
    this.canSave = edit
      ? this.commonService.checkPermission(PERMISSIONS.ProductEdit, false)
      : this.commonService.checkPermission(PERMISSIONS.ProductAdd, false);
    if (!this.canSave) {
      this.toast.error('No permission');
      return;
    }

    this.form.reset();

    this.form.patchValue({
      productStatus: 1
    });


    if (edit && data) {

      this.form.patchValue(data);

      this.currentId = data.productId;

    } else {

      this.currentId = null;

    }


       this.modalInstance = new bootstrap.Modal(this.productModal.nativeElement);
    this.modalInstance.show();
  }



  saveProduct() {
    const hasPermission = this.isEdit
      ? this.commonService.checkPermission(PERMISSIONS.ProductEdit)
      : this.commonService.checkPermission(PERMISSIONS.ProductAdd);
    if (!hasPermission) return;

    if (!this.form.valid) {

      this.form.markAllAsTouched();

      return;

    }

    const payload = { ...this.form.getRawValue() };


    if (this.isEdit && this.currentId) {

      payload.productId = this.currentId;

      this.productService.updateProduct(payload)
        .subscribe(res => {

          if (res.isSuccess) {

            this.toast.success(res.message);

            this.productService.notifyProductChanged();

            this.closeModal();

          } else {

            this.toast.error(res.message);

          }

        });

    }

    else {

      this.productService.createProduct(payload)
        .subscribe(res => {

          if (res.isSuccess) {

            this.toast.success(res.message);

            this.productService.notifyProductChanged();

            this.closeModal();

          } else {

            this.toast.error(res.message);

          }

        });

    }

  }



  closeModal() {

    this.modalInstance?.hide();

  }



  ngOnDestroy() {

    this.subs.forEach(s => s.unsubscribe());

  }

}
