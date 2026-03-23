import {
  Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild
} from '@angular/core';
import {
  AbstractControl, FormArray, FormBuilder, FormGroup, Validators
} from '@angular/forms';
import { forkJoin, Observable, of, Subscription } from 'rxjs';
import { catchError, finalize, map, tap } from 'rxjs/operators';
import { take } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { SharedModule } from '../../../shared/shared.module';
import { RationService } from '../../../core/services/ration/ration.service';
import { ToastService } from '../../../shared/services/toast.service';
import { CommonService } from '../../../shared/services/common.service';
import { ApiResponse } from '../../../core/models/api-response';
import { FeedList } from '../../../core/models/feed-list';
import { CustomValidators } from '../../../core/helpers/validators';
import { TranslatePipe } from '../../../i18n/translate.pipe';
import { TranslateService } from '../../../i18n/translate.service';
import { AnimalGroupList } from '../../../core/models/animal-group-list';
import { selectAuthUser } from '../../../state/auth/auth.selectors';

declare var bootstrap: any;

@Component({
  selector: 'app-ration-add-edit',
  standalone: true,
  imports: [SharedModule, TranslatePipe],
  templateUrl: './ration-add-edit.component.html',
  styleUrls: ['./ration-add-edit.component.css'],
})
export class RationAddEditComponent implements OnInit, OnDestroy {
  @ViewChild('rationModal', { static: true }) rationModal!: ElementRef;
  @Output() onRationSaved = new EventEmitter<void>();

  form!: FormGroup;
  modalInstance: any;

  isEdit = false;
  currentRationId: string | null = null;

  farms: any[] = [];
  animalGroups: AnimalGroupList[] = [];
  feeds: FeedList[] = [];

  farmsLoading = false;
  animalGroupsLoading = false;
  feedsLoading = false;

  // Bug #1 fix
  isAdminUser = false;
  autoFarmId: string | null = null;

  subs: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private rationService: RationService,
    private toast: ToastService,
    private commonService: CommonService,
    private translate: TranslateService,
    private store: Store
  ) {}

  ngOnInit() {
    this.initializeForm();
    this.modalInstance = new bootstrap.Modal(this.rationModal.nativeElement, { backdrop: 'static' });
    this.resolveUserRole();
    this.handleFarmChange();
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
  }

  private resolveUserRole() {
    const sub = this.store.select(selectAuthUser).pipe(take(1)).subscribe(user => {
      const roleType = (user?.roleType ?? '').toUpperCase();
      this.isAdminUser = roleType === 'ADMIN' || user?.isSuperAdmin === true;
    });
    this.subs.push(sub);
  }

  private initializeForm() {
    this.form = this.fb.group({
      farmId:        ['', Validators.required],
      animalGroupId: ['', Validators.required],
      name:          ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      rationItems:   this.fb.array([this.createRationItem()])
    });
  }

  createRationItem(item?: any): FormGroup {
    return this.fb.group({
      feedId:    [item?.feedId ?? null, Validators.required],
      perKg:     [item?.perKg ?? '', [Validators.required, CustomValidators.maxDigits(20), CustomValidators.positiveNumber()]],
      dryMatter: [item?.dryMatter ?? null],
      protein:   [item?.protein ?? null],
      pricePerKg:[item?.pricePerKg ?? null]
    });
  }

  get rationItems(): FormArray { return this.form.get('rationItems') as FormArray; }
  addRationItem() { this.rationItems.push(this.createRationItem()); }
  removeRationItem(i: number) { this.rationItems.removeAt(i); }
  private resetRationItems() { this.rationItems.clear(); this.addRationItem(); }

  // ─────────────────────────────────────────────────────────────
  // Bug #2 fix: farmId valueChanges only fires on user interaction.
  // When we patchValue programmatically (after loadFarmList), it
  // does NOT fire. We always call loadAnimalGroupsByFarm + loadFeedsByFarm
  // EXPLICITLY after setting farmId. The valueChanges listener handles
  // the admin case where the user picks a different farm manually.
  // ─────────────────────────────────────────────────────────────
  private handleFarmChange() {
    const sub = this.form.get('farmId')!.valueChanges.subscribe((farmId: string) => {
      this.animalGroups = [];
      this.feeds = [];
      this.form.get('animalGroupId')?.reset();
      this.resetRationItems();
      if (!farmId) return;
      forkJoin({
        animalGroups: this.loadAnimalGroupsByFarm(farmId),
        feeds: this.loadFeedsByFarm(farmId)
      }).subscribe();
    });
    this.subs.push(sub);
  }

  private loadAnimalGroupsByFarm(farmId: string): Observable<AnimalGroupList[]> {
    this.animalGroupsLoading = true;
    return this.commonService.getAnimalGroupByFarmID(farmId).pipe(
      map((res: ApiResponse<AnimalGroupList[]>) => res.data ?? []),
      tap((data: AnimalGroupList[]) => {
        this.animalGroups = data.map(d => ({ ...d, animalGroupId: String(d.animalGroupId) }));
      }),
      finalize(() => { this.animalGroupsLoading = false; }),
      catchError(() => {
        this.toast.error(this.translate.instant('common.FailedloadingData') || 'Failed to load animal groups');
        return of([]);
      })
    );
  }

  private loadFeedsByFarm(farmId: string): Observable<FeedList[]> {
    this.feedsLoading = true;
    return this.commonService.getFeedByFarmID(farmId).pipe(
      map((res: ApiResponse<FeedList[]>) => res.data ?? []),
      tap((data: FeedList[]) => { this.feeds = data; }),
      finalize(() => { this.feedsLoading = false; }),
      catchError(() => { this.toast.error('Failed to load feeds'); return of([]); })
    );
  }

  private loadFarmList(): Observable<any[]> {
    this.farmsLoading = true;
    return this.commonService.getFarmsList().pipe(
      map((res: ApiResponse<any>) => res?.data ?? []),
      tap((data: any[]) => {
        this.farms = Array.isArray(data)
          ? data.map(f => ({ ...f, farmId: String(f.farmId) }))
          : [];

        // Bug #1: company user → auto-select first (only) farm
        if (!this.isAdminUser && this.farms.length > 0) {
          this.autoFarmId = this.farms[0].farmId;
        }
      }),
      finalize(() => { this.farmsLoading = false; }),
      catchError(() => {
        this.toast.error(this.translate.instant('common.FailedloadingData') || 'Failed to load farms');
        return of([]);
      })
    );
  }

  openModal(edit = false, data?: any) {
    this.isEdit = edit;
    this.currentRationId = null;
    this.animalGroups = [];
    this.feeds = [];
    this.form.reset();
    this.resetRationItems();

    const sub = this.loadFarmList().subscribe(() => {
      // ── ADD MODE ──────────────────────────────────────────
      if (!edit) {
        const farmIdToUse = data?.farmId
          ? String(data.farmId)
          : this.autoFarmId;          // Bug #1: company user gets their farm auto-set

        if (farmIdToUse) {
          this.form.patchValue({ farmId: farmIdToUse });
          this.form.get('farmId')?.disable();

          // Bug #2: manually trigger loading since patchValue doesn't fire valueChanges
          forkJoin({
            animalGroups: this.loadAnimalGroupsByFarm(farmIdToUse),
            feeds: this.loadFeedsByFarm(farmIdToUse)
          }).subscribe();
        }
      }

      // ── EDIT MODE ─────────────────────────────────────────
      if (edit && data) {
        this.currentRationId = data.rationId;
        const farmId = String(data.farmId);
        const animalGroupId = String(data.animalGroupId);

        this.form.patchValue({ farmId });
        this.form.get('farmId')?.disable();

        // Bug #2: explicitly load — don't rely on valueChanges
        forkJoin({
          animalGroups: this.loadAnimalGroupsByFarm(farmId),
          feeds: this.loadFeedsByFarm(farmId)
        }).subscribe(() => {
          this.form.patchValue({ animalGroupId, name: data.rationName });
          this.rationItems.clear();
          data.items?.forEach((it: any) => {
            this.rationItems.push(this.createRationItem({
              feedId:    String(it.feedId),
              perKg:     it.perKg,
              dryMatter: it.dryMatter,
              protein:   it.protein,
              pricePerKg:it.pricePerKg
            }));
          });
        });
      }

      this.modalInstance.show();
    });

    this.subs.push(sub);
  }

  closeModal() { this.modalInstance.hide(); }

  onFeedChangeUI(item: AbstractControl) {
    const group = item as FormGroup;
    const feedId = group.get('feedId')?.value;
    const selectedFeed = this.feeds.find(f => f.feedId === feedId);
    group.patchValue({
      dryMatter:  selectedFeed?.dryMatter  ?? null,
      protein:    selectedFeed?.protein    ?? null,
      pricePerKg: selectedFeed?.pricePerKg ?? null
    });
  }

  saveRation() {
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      this.toast.warning(this.translate.instant('common.formInvalid') || 'Please fill all required fields');
      return;
    }

    const payload = { ...this.form.getRawValue(), rationId: this.currentRationId ?? undefined };
    const api$ = this.isEdit ? this.rationService.updateration(payload) : this.rationService.createration(payload);

    const sub = api$.subscribe(res => {
      if (res.isSuccess) {
        this.toast.success(res.message);
        this.rationService.notifyrationChanged();
        this.onRationSaved.emit();
        this.closeModal();
      } else {
        this.toast.error(res.message);
      }
    });
    this.subs.push(sub);
  }
}