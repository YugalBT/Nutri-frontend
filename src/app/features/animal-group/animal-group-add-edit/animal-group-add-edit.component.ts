// animal-group-add-edit.component.ts (refactored)
import { Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin, Observable, of, Subscription } from 'rxjs';
import { catchError, finalize, map, tap } from 'rxjs/operators';
import { SharedModule } from '../../../shared/shared.module';
import { AnimalGroupService } from '../../../core/services/animal-group/animal-group.service';
import { ToastService } from '../../../shared/services/toast.service';
import { CommonService } from '../../../shared/services/common.service';
import { ApiResponse } from '../../../core/models/api-response';
import { PERMISSIONS } from '../../../core/constants/permissions.constants';
import { CustomValidators } from '../../../core/helpers/validators';
import { TranslatePipe } from '../../../i18n/translate.pipe';

declare var bootstrap: any;

@Component({
  selector: 'app-animal-group-add-edit',
  standalone: true,
  imports: [SharedModule,TranslatePipe],
  templateUrl: './animal-group-add-edit.component.html',
  styleUrls: ['./animal-group-add-edit.component.css']
})
export class AnimalGroupAddEditComponent implements OnInit, OnDestroy {
  @ViewChild('animalGroupModal', { static: true }) animalGroupModal!: ElementRef;
  @Output() onAnimalGroupSaved = new EventEmitter<void>();

  form!: FormGroup;
  modalInstance: any;

  isEdit = false;
  currentAnimalGroupId: string | null = null;

  // dropdowns
  farms: any[] = [];
  animalTypes: any[] = [];
  lactations: any[] = [];

  // loading flags
  farmsLoading = false;
  typesLoading = false;
  lactationsLoading = false;

  subs: Subscription[] = [];

  // permission for current mode (set in openModal)
  isAddEditPermission = false;

  constructor(
    private fb: FormBuilder,
    private animalGroupService: AnimalGroupService,
    private toast: ToastService,
    private commonService: CommonService
  ) { }

  ngOnInit(): void {
    this.initializeForm();
    // create modal instance once; we'll call show() after data loads
    this.modalInstance = new bootstrap.Modal(this.animalGroupModal.nativeElement, { backdrop: 'static' });
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  private initializeForm(): void {
    this.form = this.fb.group({
      farmId: ['', Validators.required],
      animalTypeId: ['', Validators.required],
      animalLactationId: ['', Validators.required],
      animalGroupNameEn: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20), Validators.pattern(/^[A-Za-z\s]+$/)]],
      animalGroupNameIt: ['', [Validators.minLength(3), Validators.maxLength(20), Validators.pattern(/^[A-Za-z\s]+$/)]],
      numberOfAnimal: ['', [Validators.required, CustomValidators.maxDigits(20)]],
      avgMilkPerDay: ['', [Validators.required, CustomValidators.maxDigits(20)]],

    });
  }

  // ---------- loaders that RETURN observables (cached when available) ----------
  private loadFarmList(force = false): Observable<any[]> {
    if (!force && this.farms.length > 0) {
      return of(this.farms);
    }
    this.farmsLoading = true;
    return this.commonService.getFarmsList().pipe(
      map((res: ApiResponse<any>) => res?.data ?? []),
      tap((data: any[]) => {
        // normalize id to string to ensure select matching works
        this.farms = Array.isArray(data) ? data.map(r => ({ ...r, farmId: r.farmId != null ? String(r.farmId) : '' })) : [];
      }),
      catchError(err => {
        this.toast.error('Failed to load farms');
        return of([]);
      }),
      finalize(() => this.farmsLoading = false)
    );
  }

  private loadAnimalTypeList(force = false): Observable<any[]> {
    if (!force && this.animalTypes.length > 0) {
      return of(this.animalTypes);
    }
    this.typesLoading = true;
    return this.commonService.getAnimalTypeList().pipe(
      map((res: ApiResponse<any>) => res?.data ?? []),
      tap((data: any[]) => {
        this.animalTypes = Array.isArray(data) ? data.map(t => ({ ...t, animalTypeId: t.animalTypeId != null ? String(t.animalTypeId) : '' })) : [];
      }),
      catchError((err :ApiResponse<any>) => {
        this.toast.error(err.message);
        return of([]);
      }),
      finalize(() => this.typesLoading = false)
    );
  }

  private loadLactationList(force = false): Observable<any[]> {
    if (!force && this.lactations.length > 0) return of(this.lactations);

    this.lactationsLoading = true;
    return this.commonService.getAnimalLactationStageList().pipe(
      map((res: ApiResponse<any>) => res?.data ?? []),
      tap((data: any[]) => {
        //this.lactations = data
        this.lactations = Array.isArray(data) ? data.map(l => ({ ...l, animalLactationId: l.animalLactationId != null ? String(l.animalLactationId) : '' })) : [];
      }),
      catchError(err => {
        this.toast.error('Failed to load animal types');
        return of([]);
      }),
      finalize(() => this.lactationsLoading = false)
    );
  }



  openModal(edit = false, data?: any): void {
    this.isEdit = edit;
    this.form.reset();
    this.currentAnimalGroupId = data?.animalGroupId ?? null;

    this.isAddEditPermission = edit
      ? this.commonService.checkPermission(PERMISSIONS.AnimalGroupEdit)
      : this.commonService.checkPermission(PERMISSIONS.AnimalGroupAdd);

    const join$ = forkJoin({
      farms: this.loadFarmList(false),
      types: this.loadAnimalTypeList(false),
      lactations: this.loadLactationList(false)
    });

    const s = join$.subscribe({
      next: () => {

        if (edit && data) {
          this.form.patchValue({
            farmId: data?.farmId != null ? String(data?.farmId) : '',
            animalTypeId: data?.animalTypeId != null ? String(data?.animalTypeId) : '',
            animalLactationId: data?.animalLactationId != null ? String(data?.animalLactationId) : '',
            animalGroupNameEn: data?.animalGroupNameEn,
            animalGroupNameIt: data?.animalGroupNameIt,
            numberOfAnimal: data?.numberOfAnimal,
            avgMilkPerDay: data?.avgMilkPerDay,
          });
        }
        this.modalInstance.show();
      },
      error: () => {
        this.toast.error('Failed to load required data to open modal');
      }
    });

    this.subs.push(s);
  }

  closeModal(): void {
    this.modalInstance?.hide();
  }

  canSave(): boolean {
    return this.isAddEditPermission && this.form.valid;
  }

  saveAnimalGroup(): void {
    const hasPermission = this.isEdit
      ? this.commonService.checkPermission(PERMISSIONS.AnimalGroupEdit)
      : this.commonService.checkPermission(PERMISSIONS.AnimalGroupAdd);

    if (!hasPermission) {
      this.toast.error('You do not have permission to perform this action.');
      return;
    }

    if (!this.form.valid) {
      this.toast.warning('Please fill all required fields.');
      this.form.markAllAsTouched();
      return;
    }

    const payload: any = { ...this.form.value, animalGroupId: this.currentAnimalGroupId ?? undefined };

    if (this.isEdit && this.currentAnimalGroupId) {
      const sub = this.animalGroupService.updateAnimalGroup(payload).subscribe({
        next: (res: ApiResponse<any>) => {
          if (res.isSuccess) {
            this.toast.success(res?.message);
            this.afterSuccess();
            this.onAnimalGroupSaved.emit();
          } else {
            this.toast.error(res?.message);
          }
        },
        error: (err) => this.toast.error(err?.error?.message)
      });
      this.subs.push(sub);
    } else {
      const sub = this.animalGroupService.createAnimalGroup(payload).subscribe({
        next: (res: ApiResponse<any>) => {
          if (res.isSuccess) {
            this.toast.success(res?.message);
            this.afterSuccess();
            this.onAnimalGroupSaved.emit();
          } else {
            this.toast.error(res?.message);
          }
        },
        error: (err) => this.toast.error(err?.error?.message)
      });
      this.subs.push(sub);
    }
  }

  private afterSuccess(): void {
    try {
      this.animalGroupService.notifyanimalGroupsChanged();
    } catch (e) {
    }
    this.closeModal();
  }
}
