import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { SharedModule } from '../../../shared/shared.module';
import { ToastService } from '../../../shared/services/toast.service';
import { CommonService } from '../../../shared/services/common.service';
import { DayService } from '../../../core/services/day/day.service';
import { ApiResponse } from '../../../core/models/api-response';
import { FarmList } from '../../../core/models/farm-list';
import { PERMISSIONS } from '../../../core/constants/permissions.constants';

declare var bootstrap: any;

@Component({
  selector: 'app-day-add-edit',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './day-add-edit.component.html',
  styleUrl: './day-add-edit.component.css'
})
export class DayAddEditComponent implements OnInit, OnDestroy {

  @ViewChild('dayModal') dayModal!: ElementRef;

  form!: FormGroup;
  modalInstance: any;

  isEdit = false;
  currentDayId: string | null = null;

  farms: FarmList[] = [];
  farmsLoading = false;

  subs: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private toast: ToastService,
    private commonService: CommonService,
    private dayService: DayService
  ) {}

  ngOnInit() {
    if(!this.commonService.checkPermission(PERMISSIONS.DayAdd)|| !this.commonService.checkPermission(PERMISSIONS.DayEdit))
        return;
    this.initializeForm();
    this.loadFarmList();
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
  }

  private initializeForm() {
    this.form = this.fb.group({
      farmId: ['', Validators.required],
      date: ['', Validators.required],
      isClosed: [false]
    });
  }

  private loadFarmList() {
    this.farmsLoading = true;

    const sub = this.commonService.getFarmsList().subscribe({
      next: (res: ApiResponse<any>) => {
        this.farms = Array.isArray(res?.data) ? res.data : [];
        this.farmsLoading = false;
      },
      error: (err: ApiResponse<any>) => {
        this.farmsLoading = false;
        this.farms = [];
        this.toast.error(err.message);
      }
    });

    this.subs.push(sub);
  }

  openModal(edit = false, data?: any) {
    this.isEdit = edit;
    this.form.reset();
    this.form.patchValue({ isClosed: false });

    if (edit && data) {
      this.form.patchValue({
        farmId: data.farmId,
        date: data.date,
        isClosed: data.isClosed
      });

      this.currentDayId = data.dayId;
    } else {
      this.currentDayId = null;
    }

    this.modalInstance = new bootstrap.Modal(this.dayModal.nativeElement);
    this.modalInstance.show();
  }

  closeModal() {
    this.modalInstance?.hide();
  }

  saveDay() {
      if(!this.commonService.checkPermission(PERMISSIONS.DayAdd)|| 
      !this.commonService.checkPermission(PERMISSIONS.DayEdit))
      return;
    if (!this.form.valid) {
      this.toast.warning('Please fill all required fields');
      return;
    }

    const payload = { ...this.form.value };

    if (this.isEdit && this.currentDayId) {
      payload.dayId = this.currentDayId;

      const sub = this.dayService.updateDays(payload).subscribe(res => {
        if (res.isSuccess) {
          this.toast.success(res.message);
          this.closeModal();
        } else {
          this.toast.error(res.message);
        }
      });

      this.subs.push(sub);
    } else {
      const sub = this.dayService.createDays(payload).subscribe(res => {
        if (res.isSuccess) {
          this.toast.success(res.message);
          this.closeModal();
        } else {
          this.toast.error(res.message);
        }
      });

      this.subs.push(sub);
    }
  }
}
