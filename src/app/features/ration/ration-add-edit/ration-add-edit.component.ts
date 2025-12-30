import {
  Component,
  ElementRef,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import { forkJoin, Observable, of, Subscription } from 'rxjs';
import { catchError, finalize, map, tap } from 'rxjs/operators';
import { SharedModule } from '../../../shared/shared.module';
import { RationService } from '../../../core/services/ration/ration.service';
import { ToastService } from '../../../shared/services/toast.service';
import { CommonService } from '../../../shared/services/common.service';
import { ApiResponse } from '../../../core/models/api-response';
import { FeedList } from '../../../core/models/feed-list';
import { PERMISSIONS } from '../../../core/constants/permissions.constants';
import { CustomValidators } from '../../../core/helpers/validators';
import { TranslatePipe } from '../../../i18n/translate.pipe';
import { TranslateService } from '../../../i18n/translate.service';
import { AnimalGroupList } from '../../../core/models/animal-group-list';

declare var bootstrap: any;

@Component({
  selector: 'app-ration-add-edit',
  standalone: true,
  imports: [SharedModule, TranslatePipe],
  templateUrl: './ration-add-edit.component.html',
  styleUrls: ['./ration-add-edit.component.css']
})
export class RationAddEditComponent implements OnInit, OnDestroy {
  @ViewChild('rationModal', { static: true }) rationModal!: ElementRef;
  @Output() onRationSaved = new EventEmitter<void>();

  form!: FormGroup;
  modalInstance: any;

  isEdit = false;
  currentRationId: string | null = null;

  farms: any[] = [];
  // animalGroups: any[] = [];
  animalGroups: AnimalGroupList[] = [];
  feeds: FeedList[] = [];

  farmsLoading = false;
  animalGroupsLoading = false;
  feedsLoading = false;

  subs: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private rationService: RationService,
    private toast: ToastService,
    private commonService: CommonService,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    this.initializeForm();
    this.modalInstance = new bootstrap.Modal(this.rationModal.nativeElement, {
      backdrop: 'static'
    });
    this.handleFarmChange();
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
  }

  private initializeForm() {
    this.form = this.fb.group({
      farmId: ['', Validators.required],
      animalGroupId: ['', Validators.required],
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(20),
          Validators.pattern(/^[A-Za-z ]+$/)
        ]
      ],
      rationItems: this.fb.array([this.createRationItem()])
    });
  }

  createRationItem(item?: any): FormGroup {
    return this.fb.group({
      feedId: [item?.feedId ?? null, Validators.required],
      perKg: [
        item?.perKg ?? '',
        [
          Validators.required,
          CustomValidators.maxDigits(20),
          CustomValidators.positiveNumber()
        ]
      ],
      dryMatter: [item?.dryMatter ?? null],
      protein: [item?.protein ?? null],
      pricePerKg: [item?.pricePerKg ?? null]
    });
  }

  get rationItems(): FormArray {
    return this.form.get('rationItems') as FormArray;
  }

  addRationItem() {
    this.rationItems.push(this.createRationItem());
  }

  removeRationItem(index: number) {
    this.rationItems.removeAt(index);
  }

  /**
   * ✅ MAIN REQUIREMENT IMPLEMENTED HERE
   * Farm change → call BOTH APIs → update BOTH dropdowns
   */
  private handleFarmChange() {
    const farmControl = this.form.get('farmId');
    if (!farmControl) return;

    const sub = farmControl.valueChanges.subscribe((farmId: string) => {
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

  private loadAnimalGroupsByFarm(
  farmId: string
): Observable<AnimalGroupList[]> {

  this.animalGroupsLoading = true;

  return this.commonService.getAnimalGroupByFarmID(farmId).pipe(
    map((res: ApiResponse<AnimalGroupList[]>) => res.data ?? []),

    tap((data: AnimalGroupList[]) => {
      this.animalGroups = data.map(d => ({
        ...d,
        animalGroupId: String(d.animalGroupId)
      }));
    }),

    finalize(() => {
      this.animalGroupsLoading = false;
    }),

    catchError(() => {
      this.toast.error(
        this.translate.instant('common.FailedloadingData') ||
        'Failed to load animal groups'
      );
      return of([]);
    })
  );
}

  private loadFeedsByFarm(
  farmId: string
): Observable<FeedList[]> {

  this.feedsLoading = true;

  return this.commonService.getFeedByFarmID(farmId).pipe(
    map((res: ApiResponse<FeedList[]>) => res.data ?? []),

    tap((data: FeedList[]) => {
      this.feeds = data;
    }),

    finalize(() => {
      this.feedsLoading = false;
    }),

    catchError(() => {
      this.toast.error('Failed to load feeds');
      return of([]);
    })
  );
}


  private resetRationItems() {
    this.rationItems.clear();
    this.addRationItem();
  }

  onFeedChangeUI(item: AbstractControl) {
    const group = item as FormGroup;
    const feedId = group.get('feedId')?.value;

    const selectedFeed = this.feeds.find(f => f.feedId === feedId);

    if (!selectedFeed) {
      group.patchValue({
        dryMatter: null,
        protein: null,
        pricePerKg: null
      });
      return;
    }

    group.patchValue({
      dryMatter: selectedFeed.dryMatter,
      protein: selectedFeed.protein,
      pricePerKg: selectedFeed.pricePerKg
    });
  }

  private loadFarmList(): Observable<any[]> {
    this.farmsLoading = true;

    return this.commonService.getFarmsList().pipe(
      map((res: ApiResponse<any>) => res?.data ?? []),
      tap(data => {
        this.farms = Array.isArray(data)
          ? data.map(f => ({
              ...f,
              farmId: String(f.farmId)
            }))
          : [];
      }),
      finalize(() => (this.farmsLoading = false)),
      catchError(() => {
        this.toast.error(
          this.translate.instant('common.FailedloadingData') ||
            'Failed to load farms'
        );
        return of([]);
      })
    );
  }

  openModal(edit = false, data?: any) {
    this.isEdit = edit;
    this.currentRationId = null;
    this.form.reset();
    this.resetRationItems();

    const sub = this.loadFarmList().subscribe(() => {
      if (edit && data) {
        this.currentRationId = data.rationId;

        this.form.patchValue({
          farmId: String(data.farmId),
          animalGroupId: String(data.animalGroupId),
          name: data.rationName
        });

        this.rationItems.clear();
        data.items?.forEach((it: any) => {
          this.rationItems.push(
            this.createRationItem({
              feedId: String(it.feedId),
              perKg: it.perKg,
              dryMatter: it.dryMatter,
              protein: it.protein,
              pricePerKg: it.pricePerKg
            })
          );
        });
      }

      this.modalInstance.show();
    });

    this.subs.push(sub);
  }

  closeModal() {
    this.modalInstance.hide();
  }

  saveRation() {
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      this.toast.warning(
        this.translate.instant('common.formInvalid') ||
          'Please fill all required fields'
      );
      return;
    }

    const payload = {
      ...this.form.value,
      rationId: this.currentRationId ?? undefined
    };

    const api$ = this.isEdit
      ? this.rationService.updateration(payload)
      : this.rationService.createration(payload);

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
