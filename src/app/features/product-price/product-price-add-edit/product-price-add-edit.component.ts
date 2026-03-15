import {
  Component,
  ElementRef,
  ViewChild,
  OnInit
} from '@angular/core';

import {
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';

import { ToastService } from '../../../shared/services/toast.service';
import { SharedModule } from '../../../shared/shared.module';
import { TranslatePipe } from '../../../i18n/translate.pipe';
import { ProductSellingPriceService } from '../../../core/services/product-selling-price/product-selling-price.service';
import { CommonService } from '../../../shared/services/common.service';

declare var bootstrap: any;

@Component({
  selector: 'app-product-price-add-edit',
  standalone: true,
  imports: [SharedModule, TranslatePipe],
  templateUrl: './product-price-add-edit.component.html'
})
export class ProductPriceAddEditComponent implements OnInit {

  @ViewChild('priceModal') priceModal!: ElementRef;

  form!: FormGroup;

  modalInstance: any;
 
  products: any[] = [];

  constructor(
    private fb: FormBuilder,
    private priceService: ProductSellingPriceService,
    private toast: ToastService,
    private commonService: CommonService
  ) {}

  ngOnInit() {

    this.initializeForm();

    this.loadProducts();

  }

  initializeForm() {

    this.form = this.fb.group({

      productId: [null, Validators.required],

      priceMonth: ['', Validators.required],

      previousMonthPrice: [
        '',
        [Validators.required, Validators.min(0)]
      ],

      suggestedPrice: [
        '',
        [Validators.required, Validators.min(0)]
      ],

      customerPrice: [
        '',
        [Validators.required, Validators.min(0)]
      ],

      commissionPercent: [
        '',
        [Validators.required, Validators.min(0), Validators.max(100)]
      ],

      marginPercent: [
        '',
        [Validators.required, Validators.min(0), Validators.max(100)]
      ]

    });

  }

  loadProducts() {

    this.commonService
      .getGetAllProductList()
      .subscribe(res => {

        if (res?.isSuccess) {

          this.products = res.data ?? [];

        }

      });

  }

  openModal() {

    this.form.reset();

    if (!this.modalInstance) {

      this.modalInstance =
        new bootstrap.Modal(this.priceModal.nativeElement);

    }

    this.modalInstance.show();

  }

  save() {

    if (!this.form.valid) {

      this.form.markAllAsTouched();

      return;

    }
  const formValue = { ...this.form.value };

  if (formValue.priceMonth) {
    formValue.priceMonth = formValue.priceMonth + '-01';
  }
    this.priceService
      .savePrice(formValue)
      .subscribe(res => {

        if (res.isSuccess) {

          this.toast.success(res.message);

          this.priceService.notifyPriceChanged();

          this.modalInstance.hide();

        } else {

          this.toast.error(res.message);

        }

      });

  }

}