import {
  Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { Store } from '@ngrx/store';

import { CalfbarnService } from '../../../core/services/calfbarn/calfbarn.service';
import { ToastService } from '../../../shared/services/toast.service';
import { SharedModule } from '../../../shared/shared.module';
import { TranslatePipe } from '../../../i18n/translate.pipe';
import { CommonService } from '../../../shared/services/common.service';
import { FarmList } from '../../../core/models/farm-list';
import { AnimalGroupList } from '../../../core/models/animal-group-list';
import { FeedList } from '../../../core/models/feed-list';
import { selectAuthUser } from '../../../state/auth/auth.selectors';

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
  currentId: string | null = null;

  subs: Subscription[] = [];

  farms: FarmList[] = [];
  animalGroups: AnimalGroupList[] = [];
  starterFeeds: FeedList[] = [];

  // Bug #1 fix
  isAdminUser = false;
  autoFarmId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private calfBarnService: CalfbarnService,
    private toast: ToastService,
    private commonService: CommonService,
    private store: Store
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.resolveUserRole();
  }

  private resolveUserRole(): void {
    const sub = this.store.select(selectAuthUser).pipe(take(1)).subscribe(user => {
      const roleType = (user?.roleType ?? '').toUpperCase();
      this.isAdminUser = roleType === 'ADMIN' || user?.isSuperAdmin === true;
      this.loadDropdowns();
    });
    this.subs.push(sub);
  }

  private initializeForm(): void {
    this.form = this.fb.group({
      farmId:        ['', Validators.required],
      animalGroupId: ['', Validators.required],
      calfAgeDays:   ['', Validators.required],
      milkFeed:      ['', Validators.required],
      fiber:         ['', Validators.required],
      feedId:        ['', Validators.required]
    });
  }

  private loadDropdowns(): void {
    // Always load all feeds (not farm-scoped for calfbarn)
    const feedSub = this.commonService.getFeedList().subscribe(res => {
      if (res?.isSuccess) this.starterFeeds = Array.isArray(res?.data) ? res.data : [];
    });
    this.subs.push(feedSub);

    // Load farms — then auto-set for company user
    const farmSub = this.commonService.getFarmsList().subscribe({
      next: res => {
        this.farms = Array.isArray(res?.data) ? res.data : [];

        // Bug #1: company user — auto-set farm and load their groups
        if (!this.isAdminUser && this.farms.length > 0) {
          this.autoFarmId = String(this.farms[0].farmId);
          this.form.patchValue({ farmId: this.autoFarmId });
          this.form.get('farmId')?.disable();
          // load animal groups for this farm
          this.loadAnimalGroupsByFarm(this.autoFarmId);
        } else {
          // Admin: load all groups (no farm filter on initial load)
          const agSub = this.commonService.getAnimalGroupsList().subscribe(agRes => {
            if (agRes?.isSuccess) this.animalGroups = Array.isArray(agRes?.data) ? agRes.data : [];
          });
          this.subs.push(agSub);
        }
      },
      error: () => { this.toast.error('Failed to load farms'); }
    });
    this.subs.push(farmSub);
  }

  private loadAnimalGroupsByFarm(farmId: string): void {
    const sub = this.commonService.getAnimalGroupByFarmID(farmId).subscribe(res => {
      this.animalGroups = Array.isArray(res?.data) ? res.data : [];
    });
    this.subs.push(sub);
  }

  openModal(edit: boolean = false, data?: any): void {
    this.isEdit = edit;
    this.form.reset();

    if (edit && data) {
      this.currentId = data.calfBarnId;
      this.form.patchValue({
        farmId:        data.farmId,
        animalGroupId: data.animalGroupId,
        calfAgeDays:   data.calfAgeDays,
        milkFeed:      data.milkFeed,
        fiber:         data.fiber,
        feedId:        data.feedId
      });
      this.form.get('farmId')?.disable();
    } else {
      this.currentId = null;
      // Re-apply auto-farm for company users in add mode
      if (this.autoFarmId) {
        this.form.patchValue({ farmId: this.autoFarmId });
        this.form.get('farmId')?.disable();
      }
    }

    this.modalInstance = new bootstrap.Modal(this.calfBarnModal.nativeElement);
    this.modalInstance.show();
  }

  saveCalfBarn(): void {
    if (!this.form.valid) { this.form.markAllAsTouched(); return; }

    const payload: any = { ...this.form.getRawValue() };

    if (this.isEdit && this.currentId) {
      payload.calfBarnId = this.currentId;
      const sub = this.calfBarnService.updatecalfbarn(payload).subscribe(res => {
        if (res?.isSuccess) {
          this.toast.success(res.message);
          this.calfBarnService.notifycalfbarnChanged();
          this.saved.emit();
          this.closeModal();
        } else { this.toast.error(res.message); }
      });
      this.subs.push(sub);
    } else {
      const sub = this.calfBarnService.createcalfbarn(payload).subscribe(res => {
        if (res?.isSuccess) {
          this.toast.success(res.message);
          this.calfBarnService.notifycalfbarnChanged();
          this.saved.emit();
          this.closeModal();
        } else { this.toast.error(res.message); }
      });
      this.subs.push(sub);
    }
  }

  closeModal(): void { this.modalInstance?.hide(); this.form.reset(); }
  ngOnDestroy(): void { this.subs.forEach(s => s.unsubscribe()); }
}