import {
  Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

import { CalfbarnService } from '../../../core/services/calfbarn/calfbarn.service';
import { ToastService } from '../../../shared/services/toast.service';
import { SharedModule } from '../../../shared/shared.module';
import { TranslatePipe } from '../../../i18n/translate.pipe';
import { CommonService } from '../../../shared/services/common.service';
import { AnimalGroupList } from '../../../core/models/animal-group-list';
import { FeedList } from '../../../core/models/feed-list';
import { PERMISSIONS } from '../../../core/constants/permissions.constants';

declare var bootstrap: any;

@Component({
  selector: 'app-calf-barn-add-edit',
  standalone: true,
  imports: [SharedModule, TranslatePipe],
  templateUrl: './calfbarn-add-edit.component.html',
  styleUrl: './calfbarn-add-edit.component.css'
})
export class CalfbarnAddEditComponent implements OnInit, OnDestroy {

  @ViewChild('calfBarnModal') calfBarnModal!: ElementRef;
  @Output() saved = new EventEmitter<void>();

  form!: FormGroup;
  modalInstance: any;

  isEdit = false;
  canSave = false;
  currentId: string | null = null;

  subs: Subscription[] = [];

  animalGroups: AnimalGroupList[] = [];
  starterFeeds: FeedList[] = [];

  constructor(
    private fb: FormBuilder,
    private calfBarnService: CalfbarnService,
    private toast: ToastService,
    private commonService: CommonService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadDropdowns();
  }

  private initializeForm(): void {
    this.form = this.fb.group({
      farmId: [''],
      animalGroupId: ['', Validators.required],
      calfAgeDays: ['', Validators.required],
      milkFeed: ['', Validators.required],
      fiber: ['', Validators.required],
      feedId: ['', Validators.required]
    });
  }

  private loadDropdowns(): void {
    const feedSub = this.commonService.getFeedList().subscribe(res => {
      if (res?.isSuccess) {
        this.starterFeeds = Array.isArray(res?.data) ? res.data : [];
      }
    });
    this.subs.push(feedSub);

    const animalGroupSub = this.commonService.getAnimalGroupsList().subscribe({
      next: res => {
        if (res?.isSuccess) {
          this.animalGroups = Array.isArray(res?.data) ? res.data : [];
        }
      },
      error: () => { this.toast.error('Failed to load animal groups'); }
    });
    this.subs.push(animalGroupSub);
  }

  openModal(edit: boolean = false, data?: any): void {
    this.isEdit = edit;
    this.canSave = edit
      ? this.commonService.checkPermission(PERMISSIONS.CalfBarnEdit, false)
      : this.commonService.checkPermission(PERMISSIONS.CalfBarnAdd, false);
    if (!this.canSave) {
      this.toast.warning('No permission');
      return;
    }

    this.form.reset();

    if (edit && data) {
      this.currentId = data.calfBarnId;
      this.form.patchValue({
        farmId: data.farmId,
        animalGroupId: data.animalGroupId,
        calfAgeDays: data.calfAgeDays,
        milkFeed: data.milkFeed,
        fiber: data.fiber,
        feedId: data.feedId
      });
    } else {
      this.currentId = null;
    }

    this.modalInstance = new bootstrap.Modal(this.calfBarnModal.nativeElement);
    this.modalInstance.show();
  }

  saveCalfBarn(): void {
    const hasPermission = this.isEdit
      ? this.commonService.checkPermission(PERMISSIONS.CalfBarnEdit)
      : this.commonService.checkPermission(PERMISSIONS.CalfBarnAdd);
    if (!hasPermission) return;

    if (!this.form.valid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload: any = { ...this.form.getRawValue() };

    if (this.isEdit && this.currentId) {
      payload.calfBarnId = this.currentId;
      const sub = this.calfBarnService.updatecalfbarn(payload).subscribe(res => {
        if (res?.isSuccess) {
          this.toast.success(res.message);
          this.calfBarnService.notifycalfbarnChanged();
          this.saved.emit();
          this.closeModal();
        } else {
          this.toast.error(res.message);
        }
      });
      this.subs.push(sub);
    } else {
      const sub = this.calfBarnService.createcalfbarn(payload).subscribe(res => {
        if (res?.isSuccess) {
          this.toast.success(res.message);
          this.calfBarnService.notifycalfbarnChanged();
          this.saved.emit();
          this.closeModal();
        } else {
          this.toast.error(res.message);
        }
      });
      this.subs.push(sub);
    }
  }

  closeModal(): void {
    this.modalInstance?.hide();
    this.form.reset();
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }
}
