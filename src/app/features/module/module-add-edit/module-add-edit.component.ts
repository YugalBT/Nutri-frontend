import { Component, ElementRef, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

import { ToastService } from '../../../shared/services/toast.service';
import { ModuleListService } from '../../../core/services/module/module-list.service';
import { SharedModule } from '../../../shared/shared.module';

declare var bootstrap: any;

@Component({
  selector: 'app-module-add-edit',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './module-add-edit.component.html',
  styleUrls: ['./module-add-edit.component.css']
})
export class ModuleAddEditComponent implements OnInit, OnDestroy {

  @ViewChild('moduleModal') moduleModal!: ElementRef;

  form!: FormGroup;
  modalInstance: any;

  isEdit = false;
  currentModuleId: string | null = null;

  subs: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private toast: ToastService,
    private moduleService: ModuleListService
  ) {}

  ngOnInit() {
    this.initializeForm();
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
  }

  private initializeForm() {
    this.form = this.fb.group({
      moduleNameEn: ['', Validators.required],
      moduleNameIt: [''],
      moduleIcon: [''],
      moduleUrl: ['', Validators.required],
      isAdd: [true],
      isEdit: [true],
      isView: [true],
      isDelete: [true]
    });
  }

  openModal(edit = false, data?: any) {
    this.isEdit = edit;
    this.form.reset({
      isAdd: true,
      isEdit: true,
      isView: true,
      isDelete: true
    });

    if (edit && data) {
      this.form.patchValue(data);
      this.currentModuleId = data.moduleId;
    } else {
      this.currentModuleId = null;
    }

    this.modalInstance = new bootstrap.Modal(this.moduleModal.nativeElement);
    this.modalInstance.show();
  }

  closeModal() {
    this.modalInstance?.hide();
  }

  saveModule() {
    if (!this.form.valid) {
      this.toast.warning('Please fill all required fields');
      return;
    }

    const payload = this.form.value;

    if (this.isEdit && this.currentModuleId) {
      payload.moduleId = this.currentModuleId;

      const sub = this.moduleService.updateModule(payload).subscribe(res => {
        res.isSuccess ? this.toast.success(res.message) : this.toast.error(res.message);
        if (res.isSuccess) this.closeModal();
      });

      this.subs.push(sub);
    } else {
      const sub = this.moduleService.addModule(payload).subscribe(res => {
        res.isSuccess ? this.toast.success(res.message) : this.toast.error(res.message);
        if (res.isSuccess) this.closeModal();
      });

      this.subs.push(sub);
    }
  }
}
