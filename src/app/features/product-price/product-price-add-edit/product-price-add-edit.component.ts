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
import { PERMISSIONS } from '../../../core/constants/permissions.constants';

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
  canSave = false;

  currentId: any;

  // State driven from GetSuggestedPrice
  formulaCost = 0;
  targetMarginPercent = 0;
  minThreshold = 0;
  midThreshold = 0;
  highThreshold = 0;
  isSpecialCategory = false;
  categoryLabel = '';

  // Computed live on the form — customer price is the input, margin is the result
  marginPercent = 0;
  marginLevel = 0;     // 1 = red, 2 = yellow, 3 = green
  marginColor = '';

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

      // Auto-filled from GetSuggestedPrice, but user may override
      suggestedPrice: [0, Validators.required],

      // Customer price is the primary input now (margin is derived from it)
      customerPrice: [0, Validators.required],

      // Read-only: auto-filled from margin config for the product's category
      commissionPercent: [{ value: 0, disabled: true }],

      // Read-only: computed as (customerPrice - formulaCost) / customerPrice
      marginPercent: [{ value: 0, disabled: true }]

    });

  }

  listenPriceCalculation() {

    // When product changes, fetch suggested price + category thresholds
    this.form.get('productId')?.valueChanges.subscribe(() => {
      this.loadSuggestedPrice();
      this.loadPreviousPrice();
    });

    this.form.get('priceMonth')?.valueChanges.subscribe(() => {
      this.loadPreviousPrice();
    });

    // Margin re-computes whenever customer price or suggested price changes
    this.form.get('customerPrice')?.valueChanges.subscribe(() => {
      this.recomputeMargin();
    });

    this.form.get('suggestedPrice')?.valueChanges.subscribe(() => {
      this.recomputeMargin();
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

  loadSuggestedPrice() {

    const productId = this.form.value.productId;

    if (!productId) return;

    this.priceService
      .getSuggestedPrice(productId)
      .subscribe((res: any) => {

        if (res?.isSuccess && res.data) {

          const d = res.data;
          this.formulaCost = Number(d.formulaCost) || 0;
          this.targetMarginPercent = Number(d.targetMarginPercent) || 0;
          this.minThreshold = Number(d.minThreshold) || 0;
          this.midThreshold = Number(d.midThreshold) || 0;
          this.highThreshold = Number(d.highThreshold) || 0;
          this.isSpecialCategory = !!d.isSpecialCategory;
          this.categoryLabel = d.category || '';

          this.form.patchValue({
            suggestedPrice: d.suggestedPrice,
            customerPrice: d.suggestedPrice,
            commissionPercent: Number(d.commissionPercent) || 0
          });

          this.recomputeMargin();

        }

      });

  }

  recomputeMargin() {

    const customer = Number(this.form.getRawValue().customerPrice) || 0;
    const cost = this.formulaCost;

    if (customer <= 0) {
      this.marginPercent = 0;
      this.marginLevel = 0;
      this.marginColor = 'gray';
      this.form.patchValue({ marginPercent: 0 }, { emitEvent: false });
      return;
    }

    const margin = (customer - cost) / customer;
    this.marginPercent = margin;

    if (margin >= this.highThreshold) {
      this.marginLevel = 3;
      this.marginColor = 'green';
    } else if (margin >= this.midThreshold) {
      this.marginLevel = 2;
      this.marginColor = 'yellow';
    } else {
      this.marginLevel = 1;
      this.marginColor = 'red';
    }

    this.form.patchValue({ marginPercent: margin }, { emitEvent: false });

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
    this.canSave = isEdit
      ? this.commonService.checkPermission(PERMISSIONS.ProductPricingEdit, false)
      : this.commonService.checkPermission(PERMISSIONS.ProductPricingAdd, false);
    if (!this.canSave) {
      this.toast.error('No permission');
      return;
    }

    this.form.reset();
    this.formulaCost = 0;
    this.marginPercent = 0;
    this.marginLevel = 0;
    this.marginColor = '';

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

      this.marginPercent = Number(row.marginPercent) || 0;
      this.marginLevel = Number(row.marginLevel) || 0;
      this.marginColor = row.marginColor || 'gray';

    }

    if (!this.modalInstance) {

      this.modalInstance = new bootstrap.Modal(
        this.priceModal.nativeElement
      );

    }

    this.modalInstance.show();

  }

  save() {
    const hasPermission = this.isEdit
      ? this.commonService.checkPermission(PERMISSIONS.ProductPricingEdit)
      : this.commonService.checkPermission(PERMISSIONS.ProductPricingAdd);
    if (!hasPermission) return;

    if (!this.form.valid) {

      this.form.markAllAsTouched();

      return;

    }

    // getRawValue() includes disabled fields (commission, margin)
    const payload = { ...this.form.getRawValue() };

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
