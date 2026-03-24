import {
  Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild
} from '@angular/core';
import {
  AbstractControl, FormArray, FormBuilder, FormGroup, Validators
} from '@angular/forms';
import { Observable, of, Subscription } from 'rxjs';
import { catchError, finalize, map, tap } from 'rxjs/operators';
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

  animalGroups: AnimalGroupList[] = [];
  feeds: FeedList[] = [];

  animalGroupsLoading = false;
  feedsLoading = false;

  subs: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private rationService: RationService,
    private toast: ToastService,
    private commonService: CommonService,
    private translate: TranslateService,
  ) {}

  ngOnInit() {
    this.initializeForm();
    this.modalInstance = new bootstrap.Modal(this.rationModal.nativeElement, { backdrop: 'static' });
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
  }

  private initializeForm() {
    this.form = this.fb.group({
      farmId: [''],
      animalGroupId: ['', Validators.required],
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      rationItems: this.fb.array([this.createRationItem()])
    });
  }

  createRationItem(item?: any): FormGroup {
    return this.fb.group({
      feedId: [item?.feedId ?? null, Validators.required],
      perKg: [item?.perKg ?? '', [Validators.required, CustomValidators.maxDigits(20), CustomValidators.positiveNumber()]],
      dryMatter: [item?.dryMatter ?? null],
      protein: [item?.protein ?? null],
      pricePerKg: [item?.pricePerKg ?? null]
    });
  }

  get rationItems(): FormArray { return this.form.get('rationItems') as FormArray; }
  addRationItem() { this.rationItems.push(this.createRationItem()); }
  removeRationItem(i: number) { this.rationItems.removeAt(i); }
  private resetRationItems() { this.rationItems.clear(); this.addRationItem(); }

  private loadAnimalGroups(): Observable<AnimalGroupList[]> {
    this.animalGroupsLoading = true;
    return this.commonService.getAnimalGroupByFarmID().pipe(
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

  private loadFeeds(): Observable<FeedList[]> {
    this.feedsLoading = true;
    return this.commonService.getFeedByFarmID().pipe(
      map((res: ApiResponse<FeedList[]>) => res.data ?? []),
      tap((data: FeedList[]) => { this.feeds = data; }),
      finalize(() => { this.feedsLoading = false; }),
      catchError(() => {
        this.toast.error('Failed to load feeds');
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

    const groupsSub = this.loadAnimalGroups().subscribe(() => {
      const feedsSub = this.loadFeeds().subscribe(() => {
        if (edit && data) {
          this.currentRationId = data.rationId;
          const animalGroupId = String(data.animalGroupId);

          this.form.patchValue({ animalGroupId, name: data.rationName });
          this.rationItems.clear();
          data.items?.forEach((it: any) => {
            this.rationItems.push(this.createRationItem({
              feedId: String(it.feedId),
              perKg: it.perKg,
              dryMatter: it.dryMatter,
              protein: it.protein,
              pricePerKg: it.pricePerKg
            }));
          });
        }

        this.modalInstance.show();
      });
      this.subs.push(feedsSub);
    });

    this.subs.push(groupsSub);
  }

  closeModal() { this.modalInstance.hide(); }

  onFeedChangeUI(item: AbstractControl) {
    const group = item as FormGroup;
    const feedId = group.get('feedId')?.value;
    const selectedFeed = this.feeds.find(f => f.feedId === feedId);
    group.patchValue({
      dryMatter: selectedFeed?.dryMatter ?? null,
      protein: selectedFeed?.protein ?? null,
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
