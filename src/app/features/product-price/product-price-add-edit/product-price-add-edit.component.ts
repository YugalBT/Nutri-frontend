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

  isEdit = false;

  currentId: any;

  constructor(
    private fb: FormBuilder,
    private priceService: ProductSellingPriceService,
    private toast: ToastService,
    private commonService: CommonService
  ) { }

  ngOnInit() {

    this.initializeForm();

    this.loadProducts();

    this.listenPriceCalculation();

  }

  initializeForm() {

    this.form = this.fb.group({

      productId: ['', Validators.required],

      priceMonth: ['', Validators.required],

      previousMonthPrice: [0],

      suggestedPrice: [0, Validators.required],

      customerPrice: [0],

      commissionPercent: [0],

      marginPercent: [0]

    });

  }

  listenPriceCalculation() {

    this.form.get('suggestedPrice')?.valueChanges.subscribe(() => {
      this.calculatePrice();
    });

    this.form.get('marginPercent')?.valueChanges.subscribe(() => {
      this.calculatePrice();
    });

    this.form.get('commissionPercent')?.valueChanges.subscribe(() => {
      this.calculatePrice();
    });
    this.form.get('productId')?.valueChanges.subscribe(() => {
      this.loadPreviousPrice();
    });

    this.form.get('priceMonth')?.valueChanges.subscribe(() => {
      this.loadPreviousPrice();
    });


  }
  loadPreviousPrice() {

    const productId = this.form.value.productId;
    const month = this.form.value.priceMonth;

    if (!productId || !month) return;

    this.priceService
      .getPreviousPrice(productId, month)
      .subscribe(res => {

        if (res?.isSuccess) {

          this.form.patchValue({
            previousMonthPrice: res.data
          });

        }

      });

  }

  calculatePrice() {

    const suggested = Number(this.form.value.suggestedPrice) || 0;

    const margin = Number(this.form.value.marginPercent) || 0;

    const commission = Number(this.form.value.commissionPercent) || 0;

    const marginValue = (suggested * margin) / 100;

    const commissionValue = (suggested * commission) / 100;

    const customerPrice = suggested + marginValue + commissionValue;

    this.form.patchValue({
      customerPrice: customerPrice
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

  openModal(isEdit: boolean = false, row: any = null) {

    this.isEdit = isEdit;

    this.form.reset();

    if (isEdit && row) {

      this.currentId = row.productPriceId;

      this.form.patchValue({
        productId: row.productId,
        priceMonth: row.priceMonth?.substring(0, 7),
        previousMonthPrice: row.previousMonthPrice,
        suggestedPrice: row.suggestedPrice,
        customerPrice: row.customerPrice,
        commissionPercent: row.commissionPercent,
        marginPercent: row.marginPercent

      });

    }

    if (!this.modalInstance) {

      this.modalInstance = new bootstrap.Modal(
        this.priceModal.nativeElement
      );

    }

    this.modalInstance.show();

  }

  save() {

    if (!this.form.valid) {

      this.form.markAllAsTouched();

      return;

    }

    const payload = { ...this.form.value };

    if (payload.priceMonth) {

      payload.priceMonth = payload.priceMonth + '-01';

    }

    if (this.isEdit) {

      payload.productPriceId = this.currentId;

    }

    this.priceService
      .savePrice(payload)
      .subscribe(res => {

        if (res.isSuccess) {

          this.toast.success(res.message);

          this.priceService.notifyPriceChanged();

          this.modalInstance.hide();

        }
        else {

          this.toast.error(res.message);

        }

      });

  }

}