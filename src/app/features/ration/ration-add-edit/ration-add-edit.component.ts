import { Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin, Observable, of, Subscription } from 'rxjs';
import { catchError, finalize, map, tap } from 'rxjs/operators';
import { SharedModule } from '../../../shared/shared.module';
import { RationService } from '../../../core/services/ration/ration.service';
import { ToastService } from '../../../shared/services/toast.service';
import { CommonService } from '../../../shared/services/common.service';
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
export class RationAddEditComponent implements OnInit, OnDestroy {
  @ViewChild('rationModal', { static: true }) rationModal!: ElementRef;
  @Output() onRationSaved = new EventEmitter<void>();

  form!: FormGroup;
  modalInstance: any;

  isEdit = false;
  currentRationId: string | null = null;

  farms: any[] = [];
  animalGroups: any[] = [];
  feeds: FeedList[] = [];

  farmsLoading = false;
  animalGroupsLoading = false;
  feedsLoading = false;

  subs: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private rationService: RationService,
    private toast: ToastService,
    private commonService: CommonService
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
      farmId: ['', Validators.required],
      animalGroupId: ['', Validators.required],
      name: ['', [Validators.required, Validators.pattern(/^[A-Za-z ]+$/)]],
      rationItems: this.fb.array([ this.createRationItem() ])
    });
  }


  createRationItem(item?: any): FormGroup {
  return this.fb.group({
    feedId: [item?.feedId ?? '', Validators.required],
    perKg: [item?.perKg ?? '', Validators.required],

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

  removeRationItem(i: number) {
    this.rationItems.removeAt(i);
  }
onFeedChangeUI(item: AbstractControl) {
  debugger;
  const group = item as FormGroup;

  const feedId = group.get('feedId')?.value;

  const selectedFeed = this.feeds.find(
    f => f.feedId === feedId
  );

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







  private loadFarmList(force = false): Observable<any[]> {
    if (!force && this.farms.length > 0) return of(this.farms);
    this.farmsLoading = true;
    return this.commonService.getFarmsList().pipe(
      map((res: ApiResponse<any>) => res?.data ?? []),
      tap(data => this.farms = Array.isArray(data) ? data.map(d => ({ ...d, farmId: d.farmId != null ? String(d.farmId) : '' })) : []),
      catchError(err => {
        this.toast.error('Failed to load farms');
        return of([]);
      }),
      finalize(() => this.farmsLoading = false)
    );
  }

  private loadFeedList(force = false): Observable<FeedList[]> {
    if (!force && this.feeds.length > 0) return of(this.feeds);
    this.feedsLoading = true;
    return this.commonService.getFeedList().pipe(
      map((res: ApiResponse<any>) => Array.isArray(res?.data) ? res.data : []),
      tap(data => this.feeds = data),
      catchError(err => {
        this.toast.error('Failed to load feeds');
        return of([]);
      }),
      finalize(() => this.feedsLoading = false)
    );
  }

  private loadAnimalGroupList(force = false): Observable<any[]> {
    if (!force && this.animalGroups.length > 0) return of(this.animalGroups);
    this.animalGroupsLoading = true;
    return this.commonService.getAnimalGroupsList().pipe(
      map((res: ApiResponse<any>) => res?.data ?? []),
      tap(data => this.animalGroups = Array.isArray(data) ? data.map(d => ({ ...d, animalGroupId: d.animalGroupId != null ? String(d.animalGroupId) : '' })) : []),
      catchError(err => {
        this.toast.error('Failed to load animal groups');
        return of([]);
      }),
      finalize(() => this.animalGroupsLoading = false)
    );
  }

  /**
   * Open modal: load required dropdowns first, then patch values (if edit), then show modal.
   */
  openModal(edit = false, data?: any) {
    this.isEdit = edit;
    this.form.reset();
    this.rationItems.clear();
    this.addRationItem();
    this.currentRationId = null;

    // ensure permission check happens where you expect — keep existing logic if required
    // (you can set some permission flag here if used in template)

    const join$ = forkJoin({
      farms: this.loadFarmList(false),
      feeds: this.loadFeedList(false),
      animalGroups: this.loadAnimalGroupList(false)
    });

    const s = join$.subscribe({
      next: () => {
        if (edit && data) {
          this.currentRationId = data.rationId ?? null;

          this.form.patchValue({
            farmId: data.farmId != null ? String(data.farmId) : '',
            animalGroupId: data.animalGroupId != null ? String(data.animalGroupId) : '',
            name: data.rationName,

          });


          this.rationItems.clear();
          if (data.items && Array.isArray(data.items) && data.items.length > 0) {
            data.items.forEach((it: any) => {

              const normalized = {
                feedId: it.feedId != null ? String(it.feedId) : '',
                perKg: it.perKg,
                dryMatter: it.dryMatter,
                protein: it.protein,
                pricePerKg: it.pricePerKg
              };
              this.rationItems.push(this.createRationItem(normalized));
            });
          } else {
            this.addRationItem();
          }
        }


        this.modalInstance.show();
      },
      error: () => {
        this.toast.error('Failed to load data for ration form');
      }
    });
    this.subs.push(s);
  }

  closeModal() {
    this.modalInstance?.hide();
  }

  saveRation() {

    if(!this.commonService.checkPermission(PERMISSIONS.RationAdd)
      || !this.commonService.checkPermission(PERMISSIONS.RationEdit)) {
      this.toast.error('You do not have permission');
      return;
    }

    if (!this.form.valid) {
      debugger;
      this.toast.warning('Please fill all required fields');
      this.form.markAllAsTouched();
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
      }, err => this.toast.error(err?.error?.message));
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
      }, err => this.toast.error(err?.error?.message));
      this.subs.push(sub);
    }
  }

  private afterSuccess() {
    this.rationService.notifyrationChanged();
    this.closeModal();
  }
  
}
