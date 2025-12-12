import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Subscription } from 'rxjs';
import { RationService } from '../../../core/services/ration/ration.service';
import { ToastService } from '../../../shared/services/toast.service';
import { CommonService } from '../../../shared/services/common.service';
import { SharedModule } from '../../../shared/shared.module';
import { CustomValidators } from '../../../core/helpers/validators';
import { ApiResponse } from '../../../core/models/api-response';
import { FeedList } from '../../../core/models/feed-list';
import { PERMISSIONS } from '../../../core/constants/permissions.constants';

declare var bootstrap: any;

@Component({
  selector: 'app-ration-add-edit',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './ration-add-edit.component.html',
  styleUrls: ['./ration-add-edit.component.css']
})
export class RationAddEditComponent {

  @ViewChild('rationModal') rationModal!: ElementRef;
  @Output() onRationSaved = new EventEmitter<void>();

  form!: FormGroup;
  modalInstance: any;

  isEdit = false;
  currentRationId: string | null = null;

  farms: any[] = [];
  feeds: FeedList[] = [];

  farmsLoading = false;
  feedsLoading = false;

  subs: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private rationService: RationService,
    private toast: ToastService,
    private commonService: CommonService
  ) {}

  ngOnInit() {
    
    if(!this.commonService.checkPermission(PERMISSIONS.RationAdd)
      || !this.commonService.checkPermission(PERMISSIONS.RationEdit))
        return;
    this.initializeForm();
    this.loadFarmList(true);
    this.loadFeedList(true);
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
  }

  private initializeForm() {
    this.form = this.fb.group({
      farmId: ['', CustomValidators.required()],
      name: ['', [Validators.required, Validators.pattern(/^[A-Za-z ]+$/)]],
      targetGroup: ['', [Validators.required]],
      isForVitelli: [false],
      rationItems: this.fb.array([this.createRationItem()])
    });
  }

  createRationItem(): FormGroup {
    return this.fb.group({
      feedId: ['', Validators.required],
      perKg: ['', Validators.required]
    });
  }

  get rationItems(): FormArray {
    return this.form.get('rationItems') as FormArray;
  }

  addRationItem() {
    this.rationItems.push(this.createRationItem());
  }

  removeRationItem(i: number) {
    this.rationItems.removeAt(i);
  }

  openModal(edit = false, data?: any) {
  this.isEdit = edit;
  this.form.reset({ isForVitelli: false });
  this.rationItems.clear();
  this.addRationItem();

  if (edit && data) {
    this.currentRationId = data.rationId;

    // Patch main fields
    this.form.patchValue({
      farmId: data.farmId,
      name: data.rationName,      // notice api field is "rationName"
      targetGroup: data.targetGroup,
      isForVitelli: data.isForVitelli ?? false
    });

    // Patch ration items
    if (data.items?.length > 0) {
      this.rationItems.clear();
      data.items.forEach((item: any) => {
        this.rationItems.push(this.fb.group({
          feedId: item.feedId,
          perKg: item.perKg
        }));
      });
    } else {
      this.addRationItem();
    }
  } else {
    this.currentRationId = null;
  }

  // Show modal
  this.modalInstance = new bootstrap.Modal(this.rationModal.nativeElement);
  this.modalInstance.show();
}


  closeModal() {
    this.modalInstance?.hide();
  }

  saveRation() {
    if(!this.commonService.checkPermission(PERMISSIONS.RationAdd)
      || !this.commonService.checkPermission(PERMISSIONS.RationEdit))
        return;
    if (!this.form.valid) {
      this.toast.warning('Please fill all required fields');
      return;
    }

    const payload = {
      ...this.form.value,
      rationId: this.currentRationId ?? undefined
    };

    if (this.isEdit) {
      const sub = this.rationService.updateration(payload).subscribe(res => {
        if (res.isSuccess) {
          this.toast.success(res.message);
          this.afterSuccess();
          this.onRationSaved.emit();
        } else {
          this.toast.error(res.message);
        }
      });
      this.subs.push(sub);

    } else {
      const sub = this.rationService.createration(payload).subscribe(res => {
        if (res.isSuccess) {
          this.toast.success(res.message);
          this.afterSuccess();
          this.onRationSaved.emit();
        } else {
          this.toast.error(res.message);
        }
      });
      this.subs.push(sub);
    }
  }

  private loadFeedList(force = false) {
    if (!force && this.feeds.length > 0) return;
    this.feedsLoading = true;

    const sub = this.commonService.getFeedList().subscribe({
      next: res => {
        this.feeds = Array.isArray(res?.data) ? res.data : [];
        this.feedsLoading = false;
      },
      error: () => {
        this.feedsLoading = false;
        this.toast.error('Failed to load feeds');
      }
    });

    this.subs.push(sub);
  }

  private loadFarmList(force = false) {
    if (!force && this.farms.length > 0) return;

    const sub = this.commonService.getFarmsList().subscribe({
      next: (res: ApiResponse<any>) => {
        this.farms = res.data || [];
      }
    });

    this.subs.push(sub);
  }

  private afterSuccess() {
    this.rationService.notifyrationChanged();
    this.closeModal();
  }
}
