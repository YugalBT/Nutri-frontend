import {
  Component,
  ElementRef,
  ViewChild,
  OnInit,
  OnDestroy
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

import { CalfbarnService } from '../../../core/services/calfbarn/calfbarn.service';
import { ToastService } from '../../../shared/services/toast.service';
import { SharedModule } from '../../../shared/shared.module';
import { TranslatePipe } from '../../../i18n/translate.pipe';
import { CommonService } from '../../../shared/services/common.service';

import { FarmList } from '../../../core/models/farm-list';
import { AnimalGroupList } from '../../../core/models/animal-group-list';
import { FeedList } from '../../../core/models/feed-list';

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

  form!: FormGroup;
  modalInstance: any;

  isEdit = false;
  currentId: string | null = null;

  subs: Subscription[] = [];

  farms: FarmList[] = [];
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
      farmId: ['', Validators.required],
      animalGroupId: ['', Validators.required],
      calfAgeDays: ['', Validators.required],
      milkFeed: ['', Validators.required],
      fiber: ['', Validators.required],
      feedId: ['', Validators.required]
    });
  }

  private loadDropdowns(): void {

    

    const farmSub = this.commonService.getFarmsList().subscribe({
      next: res => {
        this.farms = Array.isArray(res?.data) ? res.data : [];
        //this.farmsLoading = false;
      },
      error: () => {
        //this.farmsLoading = false;
        this.farms = [];
        this.toast.error('Failed to load farms');
      }
    });

    const animalGroupSub = this.commonService.getAnimalGroupsList().subscribe(res => {
      if (res?.isSuccess) {
        this.animalGroups = Array.isArray(res?.data) ? res.data : [];
      }
    });

    const feedSub = this.commonService.getFeedList().subscribe(res => {
      if (res?.isSuccess) {
        this.starterFeeds = Array.isArray(res?.data) ? res.data : [];
      }
    });

    this.subs.push(farmSub, animalGroupSub, feedSub);
  }

  openModal(edit: boolean = false, data?: any): void {

    this.isEdit = edit;
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

    if (!this.form.valid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload: any = { ...this.form.getRawValue() };

    if (this.isEdit && this.currentId) {

      payload.calfBarnId = this.currentId;

      const sub = this.calfBarnService.updatecalfbarn(payload)
        .subscribe(res => {

          if (res?.isSuccess) {
            this.toast.success(res.message);
            this.calfBarnService.notifycalfbarnChanged();
            this.closeModal();
          } else {
            this.toast.error(res.message);
          }

        });

      this.subs.push(sub);

    } else {

      const sub = this.calfBarnService.createcalfbarn(payload)
        .subscribe(res => {

          if (res?.isSuccess) {
            this.toast.success(res.message);
            this.calfBarnService.notifycalfbarnChanged();
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