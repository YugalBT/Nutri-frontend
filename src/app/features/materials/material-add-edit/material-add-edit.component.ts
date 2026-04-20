import {
  Component,
  ElementRef,
  ViewChild,
  OnDestroy,
  OnInit,
  Output,
  EventEmitter
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { MaterialService } from '../../../core/services/material/material.service';
import { SupplierService } from '../../../core/services/supplier/supplier.service';
import { ToastService } from '../../../shared/services/toast.service';
import { SharedModule } from '../../../shared/shared.module';
import { TranslatePipe } from '../../../i18n/translate.pipe';
import { SupplierAddEdit } from '../../../core/models/supplier-add-edit';
import { CommonService } from '../../../shared/services/common.service';
import { SupplierList } from '../../../core/models/supplier-list';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { TokenService } from '../../../shared/services/token.service';


declare var bootstrap: any;

@Component({
  selector: 'app-material-add-edit',
  standalone: true,
  imports: [SharedModule, TranslatePipe],
  templateUrl: './material-add-edit.component.html',
})
export class MaterialAddEditComponent implements OnInit, OnDestroy {

  unitList: string[] = [
  'Kg',
  'Ton',
  'Gram',
  'Quintal',
  'Litre',
  'Millilitre',
  'Piece'
];
  @ViewChild('materialModal') materialModal!: ElementRef;
   private CodeDebounce: any;
  form!: FormGroup;
  modalInstance: any;
  isEdit = false;
  currentId: string | null = null;
  suppliers: SupplierList[] = [];

  subs: Subscription[] = [];
  isSupplier = false;
  supplierData: any = null;

  @Output() onMaterialSaved = new EventEmitter<void>();

  constructor(
    private fb: FormBuilder,
    private materialService: MaterialService,
    private supplierService: SupplierService,
    private toast: ToastService,
    private commonService: CommonService,
    private tokenservice: TokenService,
  ) {
    // Initialize supplier data before component init
    this.isSupplier = !!this.tokenservice.isSupplier();
    if (this.isSupplier) {
      this.supplierData = this.tokenservice.getSupplierData();
    }
  }

  ngOnInit() {
    this.initializeForm();
    this.loadSuppliers();
    //this.listenToMaterialNameChange();

    if (this.isSupplier && this.supplierData?.supplierId) {
      this.form.patchValue({
        supplierId: this.supplierData.supplierId
      });
      this.form.get('supplierId')?.disable();
    }
  }

  private initializeForm() {
    this.form = this.fb.group({
      materialName: ['', [Validators.required, Validators.maxLength(200)]],
     // materialCode: [{ value: '', disabled: true }, [Validators.required, Validators.maxLength(200)]],
      category: ['', [Validators.required, Validators.maxLength(100)]],
      supplierId: [this.isSupplier ? this.supplierData?.supplierId : '', Validators.required],
      unit: ['', Validators.required],
      //basePrice: ['', Validators.required]

      
    });
  }

  private listenToMaterialNameChange(): void {

  this.form.get('materialName')?.valueChanges
    .pipe(
      debounceTime(400),
      distinctUntilChanged()
    )
    .subscribe(value => {

      if (this.isEdit) 
        return; 

      if (!value || value.length < 2) {
        this.form.patchValue({ materialCode: '' }, { emitEvent: false });
        return;
      }

      this.generateMaterialCode(value);
    });
}

private generateMaterialCode(materialName: string): void {
  if (this.CodeDebounce) clearTimeout(this.CodeDebounce);

    this.CodeDebounce = setTimeout(() => {
      const sub = this.materialService
    .generateMaterialCode(materialName)
    .subscribe(res => {

      if (res?.isSuccess) {
        this.form.patchValue(
          { materialCode: res.data },
          { emitEvent: false }
        );
      } else {
        this.toast.error(res?.message);
      }
    });

  this.subs.push(sub);
    }, 400);
  
}



private loadSuppliers(): void {

  this.commonService.getSupplierList()
    .subscribe({
      next: (res) => {
        if (res?.isSuccess) {
          this.suppliers = res.data ?? [];
        } else {
          this.suppliers = [];
        }
      },
      error: () => {
        this.suppliers = [];
      }
    });
}


  openModal(edit = false, data?: any) {
    this.isEdit = edit;
    this.form.reset();

    if (edit && data) {
      this.form.patchValue(data);
      this.currentId = data.materialId;
    } else {
      this.currentId = null;
    }

    // For supplier users, ensure supplierId is always set
    if (this.isSupplier && this.supplierData?.supplierId) {
      this.form.patchValue({
        supplierId: this.supplierData.supplierId
      });
      this.form.get('supplierId')?.disable();
    }

    this.modalInstance = new bootstrap.Modal(this.materialModal.nativeElement);
    this.modalInstance.show();
  }

  saveMaterial() {

    if (!this.form.valid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = { ...this.form.getRawValue() };

    // Ensure supplierId is always included
    if (this.isSupplier && this.supplierData?.supplierId && !payload.supplierId) {
      payload.supplierId = this.supplierData.supplierId;
    }

    if (this.isEdit && this.currentId) {

      payload.materialId = this.currentId;

      this.materialService.updateMaterial(payload)
        .subscribe(res => {
          if (res.isSuccess) {
            this.toast.success(res.message);
            this.materialService.notifyMaterialsChanged();
            this.closeModal();
          } else {
            this.toast.error(res.message);
          }
        });

    } else {

      this.materialService.createMaterial(payload)
        .subscribe(res => {
          if (res.isSuccess) {
            this.toast.success(res.message);
            this.materialService.notifyMaterialsChanged();
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
