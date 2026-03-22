// fertilita-add-edit.component.ts
import { Component, ElementRef, EventEmitter, Input, OnDestroy, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { HttpService } from '../../shared/services/http.service';
import { ToastService } from '../../shared/services/toast.service';
import { API_ENDPOINTS } from '../../core/constants/api-endpoints';

declare var bootstrap: any;

@Component({
  selector: 'app-fertilita-add-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './fertilita-add-edit.component.html'
})
export class FertilitaAddEditComponent implements OnDestroy {

  @ViewChild('modal') modalRef!: ElementRef;
  @Input() farmId!: string;
  @Output() saved = new EventEmitter<void>();

  form!: FormGroup;
  modal: any;
  isEdit = false;
  currentId: string | null = null;
  isSaving = false;
  private subs: Subscription[] = [];

  eventTypes = ['Insemination', 'Pregnancy Check', 'Synchronization', 'Heat Detection'];
  resultOptions = ['Positive', 'Negative', 'Pending', 'N/A'];

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
        eventType: data.eventType,
        result: data.result,
        bullCode: data.bullCode,
        daysInMilk: data.daysInMilk,
        estimatedDaysPregnant: data.estimatedDaysPregnant,
        notes: data.notes
      });
    }

    this.modal = new bootstrap.Modal(this.modalRef.nativeElement);
    this.modal.show();
  }

  initForm(): void {
    this.form = this.fb.group({
      recordDate: [new Date().toISOString().split('T')[0], Validators.required],
      cowId: [null],
      cowName: [null],
      eventType: ['Insemination', Validators.required],
      result: ['Pending'],
      bullCode: [null],
      daysInMilk: [null],
      estimatedDaysPregnant: [null],
      notes: [null]
    });
  }

  showPregnancyDays(): boolean {
    return this.form.get('eventType')?.value === 'Pregnancy Check';
  }

  showBullCode(): boolean {
    return this.form.get('eventType')?.value === 'Insemination';
  }

  save(): void {
    if (this.form.invalid || this.isSaving) { this.form.markAllAsTouched(); return; }
    this.isSaving = true;
    const payload = { ...this.form.value, farmId: this.farmId };
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
}
