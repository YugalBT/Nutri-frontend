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
import { TranslateService } from '../../../i18n/translate.service';
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
    private commonService: CommonService,
    private translate: TranslateService
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
      customerPrice: [0, [Validators.required, Validators.min(0.01)]],

      // Read-only: auto-filled from margin config for the product's category
      commissionPercent: [{ value: 0, disabled: true }],

      // Read-only: computed as (customerPrice - formulaCost) / customerPrice
      marginPercent: [{ value: 0, disabled: true }]

    });

  }

  private resetPricingContext() {
    this.formulaCost = 0;
    this.targetMarginPercent = 0;
    this.minThreshold = 0;
    this.midThreshold = 0;
    this.highThreshold = 0;
    this.isSpecialCategory = false;
    this.categoryLabel = '';
    this.marginPercent = 0;
    this.marginLevel = 0;
    this.marginColor = '';
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

    const { productId, priceMonth: month } = this.form.getRawValue();

    if (!productId || !month) return;

    this.priceService
      .getPreviousPrice(productId, month)
      .subscribe(res => {

        if (res?.isSuccess) {

          this.form.patchValue({
            previousMonthPrice: res.data
          });

        } else {
          this.form.patchValue({
            previousMonthPrice: 0
          });
        }

      }, () => {
        this.form.patchValue({
          previousMonthPrice: 0
        });
      });

  }

  loadSuggestedPrice(preserveCurrentPrices = false) {

    const productId = this.form.getRawValue().productId;

    if (!productId) return;

    this.priceService
      .getSuggestedPrice(productId)
      .subscribe({
        next: (res: any) => {
          if (res?.isSuccess && res.data) {
            const d = res.data;
            this.formulaCost = Number(d.formulaCost) || 0;
            this.targetMarginPercent = Number(d.targetMarginPercent) || 0;
            this.minThreshold = Number(d.minThreshold) || 0;
            this.midThreshold = Number(d.midThreshold) || 0;
            this.highThreshold = Number(d.highThreshold) || 0;
            this.isSpecialCategory = !!d.isSpecialCategory;
            this.categoryLabel = d.category || '';

            const patch: Record<string, number> = {
              commissionPercent: Number(d.commissionPercent) || 0
            };

            if (!preserveCurrentPrices) {
              patch['suggestedPrice'] = Number(d.suggestedPrice) || 0;
              patch['customerPrice'] = Number(d.suggestedPrice) || 0;
            }

            this.form.patchValue(patch, { emitEvent: false });
            this.recomputeMargin();

            if (this.categoryLabel && this.formulaCost <= 0) {
              this.toast.warning(
                this.translate.instant('productPrice.messages.zeroFormulaCost') ||
                'Formula cost is 0 for this product. Suggested price may be incomplete.'
              );
            }
          }
        },
        error: () => {
          this.resetPricingContext();
          this.form.patchValue({
            commissionPercent: 0,
            marginPercent: 0
          }, { emitEvent: false });
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

    this.form.reset({
      productId: '',
      priceMonth: '',
      previousMonthPrice: 0,
      suggestedPrice: 0,
      customerPrice: 0,
      commissionPercent: 0,
      marginPercent: 0
    });
    this.currentId = null;
    this.resetPricingContext();

    if (this.isEdit) {
      this.form.get('productId')?.disable({ emitEvent: false });
      this.form.get('priceMonth')?.disable({ emitEvent: false });
    } else {
      this.form.get('productId')?.enable({ emitEvent: false });
      this.form.get('priceMonth')?.enable({ emitEvent: false });
    }

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
      }, { emitEvent: false });

      this.loadSuggestedPrice(true);
      this.loadPreviousPrice();

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

    if ((Number(this.form.getRawValue().customerPrice) || 0) <= 0) {
      this.form.get('customerPrice')?.markAsTouched();
      this.toast.error(
        this.translate.instant('productPrice.validation.customerPriceMin') ||
        'Customer price must be greater than 0'
      );
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

    const request$ = this.isEdit
      ? this.priceService.updatePrice(payload)
      : this.priceService.createPrice(payload);

    request$
      .subscribe({
        next: (res) => {
          if (res.isSuccess) {
            this.toast.success(res.message);
            this.priceService.notifyPriceChanged();
            this.modalInstance.hide();
          }
          else {
            this.toast.error(res.message);
          }
        },
        error: (err) => {
          this.toast.error(
            err?.error?.message ||
            this.translate.instant('productPrice.messages.saveFailed') ||
            'Failed to save product price'
          );
        }
      });

  }

}
