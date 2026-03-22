// parti-add-edit.component.ts
import { Component, ElementRef, EventEmitter, Input, OnDestroy, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { HttpService } from '../../shared/services/http.service';
import { ToastService } from '../../shared/services/toast.service';
import { API_ENDPOINTS } from '../../core/constants/api-endpoints';

declare var bootstrap: any;

@Component({
  selector: 'app-parti-add-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './parti-add-edit.component.html'
})
export class PartiAddEditComponent implements OnDestroy {

  @ViewChild('modal') modalRef!: ElementRef;
  @Input() farmId!: string;
  @Output() saved = new EventEmitter<void>();

  form!: FormGroup;
  modal: any;
  isEdit = false;
  currentId: string | null = null;
  isSaving = false;
  private subs: Subscription[] = [];

  genderOptions = [{ value: 'M', label: 'Male' }, { value: 'F', label: 'Female' }];
  typeOptions = ['Single', 'Twins', 'Triplets'];
  outcomeOptions = ['Easy', 'Assisted', 'Caesarean', 'Stillborn'];

  constructor(private fb: FormBuilder, private http: HttpService, private toast: ToastService) { }

  openModal(edit = false, data?: any): void {
    this.isEdit = edit;
    this.currentId = null;
    this.initForm();

    if (edit && data) {
      this.currentId = data.calvingId;
      this.form.patchValue({
        calvingDate: data.calvingDate,
        cowId: data.cowId,
        cowName: data.cowName,
        calfGender: data.calfGender,
        calvingType: data.calvingType,
        calvingOutcome: data.calvingOutcome,
        calfWeightKg: data.calfWeightKg,
        notes: data.notes
      });
    }

    this.modal = new bootstrap.Modal(this.modalRef.nativeElement);
    this.modal.show();
  }

  initForm(): void {
    this.form = this.fb.group({
      calvingDate: [new Date().toISOString().split('T')[0], Validators.required],
      cowId: [null],
      cowName: [null],
      calfGender: [null],
      calvingType: ['Single'],
      calvingOutcome: ['Easy'],
      calfWeightKg: [null],
      notes: [null]
    });
  }

  save(): void {
    if (this.form.invalid || this.isSaving) { this.form.markAllAsTouched(); return; }
    this.isSaving = true;
    const payload = { ...this.form.value, farmId: this.farmId };

    const url = this.isEdit
      ? API_ENDPOINTS.CALVING.UPDATE
      : API_ENDPOINTS.CALVING.CREATE;

    if (this.isEdit) payload['calvingId'] = this.currentId;

    const sub = this.http.post<any>(url, payload).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.toast.success(res.message);
          this.saved.emit();
          this.modal?.hide();
        } else {
          this.toast.error(res.message);
        }
        this.isSaving = false;
      },
      error: () => { this.toast.error('Error saving'); this.isSaving = false; }
    });
    this.subs.push(sub);
  }

  closeModal(): void { this.modal?.hide(); }
  ngOnDestroy(): void { this.subs.forEach(s => s.unsubscribe()); }
}
