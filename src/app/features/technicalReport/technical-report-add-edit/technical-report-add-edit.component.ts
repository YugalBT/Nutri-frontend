import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { ToastService } from '../../../shared/services/toast.service';
import { TechnicalReportService } from '../../../core/services/technical-report/technical-report.service';
import { SharedModule } from '../../../shared/shared.module';
declare var bootstrap: any;

@Component({
  selector: 'app-technical-report-add-edit',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './technical-report-add-edit.component.html',
  styleUrl: './technical-report-add-edit.component.css'
})
export class TechnicalReportAddEditComponent {

  @ViewChild('reportModal') reportModal!: ElementRef;
  @ViewChild('dateInput') dateInput!: ElementRef<HTMLInputElement>;

  form!: FormGroup;
  modal: any;

  isEdit = false;
  currentId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private service: TechnicalReportService,
    private toast: ToastService
  ) {
    this.form = this.fb.group({
      rationId: [null, Validators.required],
      reportDate: [{ value: null, disabled: true }],
      animalCount: [null, [Validators.required, Validators.min(1)]]
    });

  }

  openModal(rationId: string) {
    this.form.reset();
    const today = new Date().toISOString().split('T')[0];
    this.form.patchValue({
      rationId: rationId,
      //reportDate: today
    });

    this.modal = new bootstrap.Modal(this.reportModal.nativeElement);
    this.modal.show();
  }



  closeModal() {
    this.modal?.hide();
  }

  openDatePicker() {
    this.dateInput.nativeElement.showPicker();
  }
  private isToday(date: string | Date | null): boolean {
    if (!date) return false;

    const selected = new Date(date);
    const today = new Date();

    return (
      selected.getFullYear() === today.getFullYear() &&
      selected.getMonth() === today.getMonth() &&
      selected.getDate() === today.getDate()
    );
  }


  save() {
    if (this.form.invalid) {
      this.toast.warning('Please fill all required fields');
      return;
    }

    const payload = { ...this.form.getRawValue() };


    if (this.isEdit && this.currentId) {
      payload.technicalReportId = this.currentId;
      this.service.updateTechnicalReports(payload).subscribe(res => {
        this.toast.success(res.message);
        this.service.notifytechnicalReportsChanged();
        this.closeModal();
      });
    } else {
      this.service.createTechnicalReports(payload).subscribe(res => {
        this.toast.success(res.message);
        this.service.notifytechnicalReportsChanged();
        this.closeModal();
      });
    }
  }



}
