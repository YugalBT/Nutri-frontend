// import {
//   Component,
//   ElementRef,
//   OnInit,
//   ViewChild
// } from '@angular/core';
// import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { SharedModule } from '../../../shared/shared.module';
// import { TranslatePipe } from '../../../i18n/translate.pipe';
// import { SupplierPriceService } from '../../../core/services/supplier-price/supplier-price.service';
// import { ToastService } from '../../../shared/services/toast.service';
// import { CommonService } from '../../../shared/services/common.service';

// declare var bootstrap: any;

// export enum SupplierPriceStatus {
//   AVAILABLE = 'AVAILABLE',
//   BUSY = 'BUSY',
//   AWAY = 'AWAY',
//   OFFLINE = 'OFFLINE'
// }

// @Component({
//   selector: 'app-supplier-price-add-edit',
//   standalone: true,
//   imports: [SharedModule, TranslatePipe],
//   templateUrl: './supplier-price-add-edit.component.html',
//   styleUrl: './supplier-price-add-edit.component.css'
// })
// export class SupplierPriceAddEditComponent implements OnInit {

//   @ViewChild('supplierPriceModal') supplierPriceModal!: ElementRef;

//   form!: FormGroup;
//   modalInstance: any;
//   isEdit = false;
//   currentId: string | null = null;

//   suppliers: any[] = [];
//   materials: any[] = [];
//   statusOptions = Object.values(SupplierPriceStatus);

//   constructor(
//     private fb: FormBuilder,
//     private supplierPriceService: SupplierPriceService,
//     private toast: ToastService,
//     private commonService: CommonService
//   ) {}

//   ngOnInit() {
//     this.initializeForm();
//     this.loadSuppliers();
//   }

//   initializeForm() {
//     this.form = this.fb.group({
//       supplierId: ['', Validators.required],
//       materialId: ['', Validators.required],
//       price: [
//         '',
//         [
//           Validators.required,
//           Validators.min(0.01),
//           Validators.pattern(/^\d+(\.\d{1,2})?$/)
//         ]
//       ],
//       status: ['', Validators.required]
//     });
//   }

//   loadSuppliers() {
//     this.commonService.getSupplierList()
//       .subscribe(res => this.suppliers = res.data || []);
//   }

//   onSupplierChange() {
//     const supplierId = this.form.get('supplierId')?.value;

//     if (!supplierId) {
//       this.materials = [];
//       return;
//     }

//     this.commonService
//       .GetAllMaterialBySupplierId(supplierId)
//       .subscribe(res => this.materials = res.data || []);
//   }

//   openModal(edit = false, data?: any) {
//     this.isEdit = edit;
//     this.form.reset();
//     this.materials = [];

//     if (edit && data) {
//       this.currentId = data.supplierPriceId;

//       this.form.patchValue({
//         supplierId: data.supplierId,
//         materialId: data.materialId,
//         price: data.price,
//         status: data.status
//       });

//       this.onSupplierChange();
//     }

//     this.modalInstance = new bootstrap.Modal(
//       this.supplierPriceModal.nativeElement
//     );
//     this.modalInstance.show();
//   }

//   save() {
//     if (this.form.invalid) {
//       this.form.markAllAsTouched();
//       this.toast.warning("Please fix validation errors");
//       return;
//     }

//     const payload = {
//       ...this.form.value,
//       supplierPriceId: this.currentId
//     };

//     const apiCall = this.isEdit
//       ? this.supplierPriceService.updateSupplierPrice(payload)
//       : this.supplierPriceService.createSupplierPrice(payload);

//     apiCall.subscribe(res => {
//       if (res.isSuccess) {
//         this.toast.success(res.message);
//         this.supplierPriceService.notifySupplierPriceChanged();
//         this.closeModal();
//       } else {
//         this.toast.error(res.message);
//       }
//     });
//   }

//   closeModal() {
//     this.modalInstance?.hide();
//   }
// }
