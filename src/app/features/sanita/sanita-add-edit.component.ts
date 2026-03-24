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
  selector: 'app-sanita-add-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './sanita-add-edit.component.html'
})
export class SanitaAddEditComponent implements OnDestroy {

  @ViewChild('modal', { static: true }) modalRef!: ElementRef;
  @Input() farmId!: string;
  @Output() saved = new EventEmitter<void>();

  form!: FormGroup;
  modal: any;
  isEdit = false;
  currentId: string | null = null;
  isSaving = false;
  private subs: Subscription[] = [];

  eventTypes = [
    'sanita.eventTypes.mastitis',
    'sanita.eventTypes.lameness',
    'sanita.eventTypes.respiratory',
    'sanita.eventTypes.metabolic',
    'sanita.eventTypes.reproductive',
    'sanita.eventTypes.other'
  ];

  constructor(private fb: FormBuilder, private http: HttpService, private toast: ToastService) { }

  openModal(edit = false, data?: any): void {
    this.isEdit = edit;
    this.currentId = null;
    this.initForm();

    if (edit && data) {
      this.currentId = data.healthEventId;
      this.form.patchValue({
        eventDate: data.eventDate,
        cowId: data.cowId,
        eventType: this.mapEventTypeToKey(data.eventType),
        diagnosis: data.diagnosis,
        treatment: data.treatment,
        veterinarianName: data.veterinarianName,
        withholdingDays: data.withholdingDays,
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
      eventDate: [new Date().toISOString().split('T')[0], Validators.required],
      cowId: [null],
      eventType: ['sanita.eventTypes.mastitis', Validators.required],
      diagnosis: [null],
      treatment: [null],
      veterinarianName: [null],
      withholdingDays: [0],
      notes: [null]
    });
  }

  save(): void {
    if (this.form.invalid || this.isSaving) { this.form.markAllAsTouched(); return; }
    this.isSaving = true;
    const payload = {
      ...this.form.value,
      farmId: this.farmId,
      eventType: this.mapEventTypeFromKey(this.form.value.eventType)
    };
    if (this.isEdit) payload['healthEventId'] = this.currentId;

    const url = this.isEdit ? API_ENDPOINTS.HEALTH_EVENT.UPDATE : API_ENDPOINTS.HEALTH_EVENT.CREATE;

    const sub = this.http.post<any>(url, payload).subscribe({
      next: (res) => {
        if (res.isSuccess) { this.toast.success(res.message); this.saved.emit(); this.modal?.hide(); }
        else this.toast.error(res.message);
        this.isSaving = false;
      },
      error: () => { this.toast.error('Error saving'); this.isSaving = false; }
    });
    this.subs.push(sub);
  }

  closeModal(): void { this.modal?.hide(); }
  ngOnDestroy(): void { this.subs.forEach(s => s.unsubscribe()); }

  private mapEventTypeToKey(value: string | null | undefined): string {
    const map: Record<string, string> = {
      Mastitis: 'sanita.eventTypes.mastitis',
      Lameness: 'sanita.eventTypes.lameness',
      Respiratory: 'sanita.eventTypes.respiratory',
      Metabolic: 'sanita.eventTypes.metabolic',
      Reproductive: 'sanita.eventTypes.reproductive',
      Other: 'sanita.eventTypes.other'
    };
    return map[value || ''] || 'sanita.eventTypes.mastitis';
  }

  private mapEventTypeFromKey(value: string | null | undefined): string {
    const map: Record<string, string> = {
      'sanita.eventTypes.mastitis': 'Mastitis',
      'sanita.eventTypes.lameness': 'Lameness',
      'sanita.eventTypes.respiratory': 'Respiratory',
      'sanita.eventTypes.metabolic': 'Metabolic',
      'sanita.eventTypes.reproductive': 'Reproductive',
      'sanita.eventTypes.other': 'Other'
    };
    return map[value || ''] || 'Mastitis';
  }
}
