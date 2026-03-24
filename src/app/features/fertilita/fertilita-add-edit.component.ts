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
  selector: 'app-fertilita-add-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './fertilita-add-edit.component.html'
})
export class FertilitaAddEditComponent implements OnDestroy {

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
    'fertilita.eventTypes.insemination',
    'fertilita.eventTypes.pregnancyCheck',
    'fertilita.eventTypes.synchronization',
    'fertilita.eventTypes.heatDetection'
  ];
  resultOptions = [
    'fertilita.results.positive',
    'fertilita.results.negative',
    'fertilita.results.pending',
    'fertilita.results.notApplicable'
  ];

  constructor(private fb: FormBuilder, private http: HttpService, private toast: ToastService) { }

  openModal(edit = false, data?: any): void {
    this.isEdit = edit;
    this.currentId = null;
    this.initForm();

    if (edit && data) {
      this.currentId = data.fertilityRecordId;
      this.form.patchValue({
        recordDate: data.recordDate,
        cowId: data.cowId,
        cowName: data.cowName,
        eventType: this.mapEventTypeToKey(data.eventType),
        result: this.mapResultToKey(data.result),
        bullCode: data.bullCode,
        daysInMilk: data.daysInMilk,
        estimatedDaysPregnant: data.estimatedDaysPregnant,
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
      recordDate: [new Date().toISOString().split('T')[0], Validators.required],
      cowId: [null],
      cowName: [null],
      eventType: ['fertilita.eventTypes.insemination', Validators.required],
      result: ['fertilita.results.pending'],
      bullCode: [null],
      daysInMilk: [null],
      estimatedDaysPregnant: [null],
      notes: [null]
    });
  }

  showPregnancyDays(): boolean {
    return this.form.get('eventType')?.value === 'fertilita.eventTypes.pregnancyCheck';
  }

  showBullCode(): boolean {
    return this.form.get('eventType')?.value === 'fertilita.eventTypes.insemination';
  }

  save(): void {
    if (this.form.invalid || this.isSaving) { this.form.markAllAsTouched(); return; }
    this.isSaving = true;
    const payload = {
      ...this.form.value,
      farmId: this.farmId,
      eventType: this.mapEventTypeFromKey(this.form.value.eventType),
      result: this.mapResultFromKey(this.form.value.result)
    };
    if (this.isEdit) payload['fertilityRecordId'] = this.currentId;

    const url = this.isEdit
      ? API_ENDPOINTS.FERTILITY_RECORD.UPDATE
      : API_ENDPOINTS.FERTILITY_RECORD.CREATE;

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
      'Insemination': 'fertilita.eventTypes.insemination',
      'Pregnancy Check': 'fertilita.eventTypes.pregnancyCheck',
      'Synchronization': 'fertilita.eventTypes.synchronization',
      'Heat Detection': 'fertilita.eventTypes.heatDetection'
    };
    return map[value || ''] || 'fertilita.eventTypes.insemination';
  }

  private mapEventTypeFromKey(value: string | null | undefined): string {
    const map: Record<string, string> = {
      'fertilita.eventTypes.insemination': 'Insemination',
      'fertilita.eventTypes.pregnancyCheck': 'Pregnancy Check',
      'fertilita.eventTypes.synchronization': 'Synchronization',
      'fertilita.eventTypes.heatDetection': 'Heat Detection'
    };
    return map[value || ''] || 'Insemination';
  }

  private mapResultToKey(value: string | null | undefined): string {
    const map: Record<string, string> = {
      Positive: 'fertilita.results.positive',
      Negative: 'fertilita.results.negative',
      Pending: 'fertilita.results.pending',
      'N/A': 'fertilita.results.notApplicable'
    };
    return map[value || ''] || 'fertilita.results.pending';
  }

  private mapResultFromKey(value: string | null | undefined): string {
    const map: Record<string, string> = {
      'fertilita.results.positive': 'Positive',
      'fertilita.results.negative': 'Negative',
      'fertilita.results.pending': 'Pending',
      'fertilita.results.notApplicable': 'N/A'
    };
    return map[value || ''] || 'Pending';
  }
}
