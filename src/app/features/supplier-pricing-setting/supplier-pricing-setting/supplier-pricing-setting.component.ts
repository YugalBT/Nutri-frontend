import { Component, OnInit } from '@angular/core';
import { take } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { SharedModule } from '../../../shared/shared.module';
import { TranslatePipe } from '../../../i18n/translate.pipe';
import { SupplierPricingSettingService } from '../../../core/services/supplier-pricing-setting/supplier-pricing-setting.service';
import { CommonService } from '../../../shared/services/common.service';
import { PERMISSIONS } from '../../../core/constants/permissions.constants';

@Component({
  selector: 'app-supplier-pricing-setting',
  standalone: true,
  imports: [ReactiveFormsModule, SharedModule, TranslatePipe],
  templateUrl: './supplier-pricing-setting.component.html',
  styleUrls: ['./supplier-pricing-setting.component.css']
})
export class SupplierPricingSettingComponent implements OnInit {

  pricingForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private toast: ToastrService,
    private pricingService: SupplierPricingSettingService,
    private commonService: CommonService
  ) {}

  ngOnInit(): void {

    // if (
    //   !this.commonService.checkPermission(PERMISSIONS.PricingSettingEdit) ||
    //   !this.commonService.checkPermission(PERMISSIONS.PricingSettingView)
    // ) {
    //   return;
    // }
    
    this.initializeForm();
    this.getPricingSetting();
  }

  initializeForm() {

    this.pricingForm = this.fb.group({

      bulkProcessingCost: [
        null,
        [Validators.required, Validators.min(0)]
      ],

      bagProcessingCost: [
        null,
        [Validators.required, Validators.min(0)]
      ],

      bulkTransportCost: [
        null,
        [Validators.required, Validators.min(0)]
      ],

      sackTransportCost: [
        null,
        [Validators.required, Validators.min(0)]
      ],

      commissionPercent: [
        null,
        [Validators.required, Validators.min(0), Validators.max(100)]
      ],

      defaultMarginPercent: [
        null,
        [Validators.required, Validators.min(0), Validators.max(100)]
      ]

    });

  }

  getPricingSetting() {

    this.pricingService.getAll()
      .pipe(take(1))
      .subscribe({

        next: (res: any) => {

          if (res?.isSuccess && res?.data) {

            this.pricingForm.patchValue(res.data);

          } else {

            this.toast.error(res?.message);

          }

        },

        error: (err: any) => {

          const message = err?.error?.message;
          this.toast.error(message);

        }

      });

  }

  onSubmit() {

    if (this.pricingForm.invalid) {

      this.pricingForm.markAllAsTouched();
      this.toast.error('Please correct the errors in the form before submitting.');
      return;

    }

    const payload = this.pricingForm.value;

    this.pricingService.update(payload)
      .pipe(take(1))
      .subscribe({

        next: (res: any) => {

          if (res?.isSuccess) {

            this.toast.success(res?.message);

          } else {

            this.toast.error(res?.message);

          }

        },

        error: (err: any) => {

          const message = err?.error?.message;
          this.toast.error(message);

        }

      });

  }

}