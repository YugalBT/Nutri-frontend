import { Component, ElementRef, EventEmitter, Input, OnDestroy, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { HttpService } from '../../shared/services/http.service';
import { ToastService } from '../../shared/services/toast.service';
import { API_ENDPOINTS } from '../../core/constants/api-endpoints';
import { TranslatePipe } from '../../i18n/translate.pipe';

declare var bootstrap: any;

@Component({
  selector: 'app-parti-add-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './parti-add-edit.component.html'
})
export class PartiAddEditComponent implements OnDestroy {

  @ViewChild('modal', { static: true }) modalRef!: ElementRef;
  @Input() farmId!: string;
  @Output() saved = new EventEmitter<void>();

  form!: FormGroup;
  modal: any;
  isEdit = false;
  currentId: string | null = null;
  isSaving = false;
  private subs: Subscription[] = [];

  genderOptions = [
    { value: 'M', label: 'parti.options.gender.male' },
    { value: 'F', label: 'parti.options.gender.female' }
  ];
  typeOptions = ['parti.options.type.single', 'parti.options.type.twins', 'parti.options.type.triplets'];
  outcomeOptions = [
    'parti.options.outcome.easy',
    'parti.options.outcome.assisted',
    'parti.options.outcome.caesarean',
    'parti.options.outcome.stillborn'
  ];

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
        calvingType: this.mapCalvingTypeToKey(data.calvingType),
        calvingOutcome: this.mapCalvingOutcomeToKey(data.calvingOutcome),
        calfWeightKg: data.calfWeightKg,
        notes: data.notes
      });
    }

    const modalElement = this.modalRef?.nativeElement;
    if (!modalElement) {
      return;
    }

    this.modal = new bootstrap.Modal(modalElement);
    this.modal.show();
  }

  initForm(): void {
    this.form = this.fb.group({
      calvingDate: [new Date().toISOString().split('T')[0], Validators.required],
      cowId: [null],
      cowName: [null],
      calfGender: [null],
      calvingType: ['parti.options.type.single'],
      calvingOutcome: ['parti.options.outcome.easy'],
      calfWeightKg: [null],
      notes: [null]
    });
  }

  save(): void {
    if (this.form.invalid || this.isSaving) { this.form.markAllAsTouched(); return; }
    this.isSaving = true;
    const payload = {
      ...this.form.value,
      calvingType: this.mapCalvingTypeFromKey(this.form.value.calvingType),
      calvingOutcome: this.mapCalvingOutcomeFromKey(this.form.value.calvingOutcome)
    };

    const url = this.isEdit ? API_ENDPOINTS.CALVING.UPDATE : API_ENDPOINTS.CALVING.CREATE;

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

  private mapCalvingTypeToKey(value: string | null | undefined): string {
    const map: Record<string, string> = {
      Single: 'parti.options.type.single',
      Twins: 'parti.options.type.twins',
      Triplets: 'parti.options.type.triplets'
    };
    return map[value || ''] || 'parti.options.type.single';
  }

  private mapCalvingTypeFromKey(value: string | null | undefined): string {
    const map: Record<string, string> = {
      'parti.options.type.single': 'Single',
      'parti.options.type.twins': 'Twins',
      'parti.options.type.triplets': 'Triplets'
    };
    return map[value || ''] || 'Single';
  }

  private mapCalvingOutcomeToKey(value: string | null | undefined): string {
    const map: Record<string, string> = {
      Easy: 'parti.options.outcome.easy',
      Assisted: 'parti.options.outcome.assisted',
      Caesarean: 'parti.options.outcome.caesarean',
      Stillborn: 'parti.options.outcome.stillborn'
    };
    return map[value || ''] || 'parti.options.outcome.easy';
  }

  private mapCalvingOutcomeFromKey(value: string | null | undefined): string {
    const map: Record<string, string> = {
      'parti.options.outcome.easy': 'Easy',
      'parti.options.outcome.assisted': 'Assisted',
      'parti.options.outcome.caesarean': 'Caesarean',
      'parti.options.outcome.stillborn': 'Stillborn'
    };
    return map[value || ''] || 'Easy';
  }
}
