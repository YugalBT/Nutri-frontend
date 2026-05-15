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
import { TranslateService } from '../../../i18n/translate.service';

declare var bootstrap: any;

@Component({
  selector: 'app-animal-group-add-edit',
  standalone: true,
  imports: [SharedModule, TranslatePipe],
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

  animalTypes: any[] = [];
  lactations: any[] = [];

  typesLoading = false;
  lactationsLoading = false;

  subs: Subscription[] = [];
  isAddEditPermission = false;

  // dropdown animal category
  animalCategories: any[] = [
    "VL",
    "AS",
    "MA",
    "MZ",
    "VI"
  ];


  constructor(
    private fb: FormBuilder,
    private animalGroupService: AnimalGroupService,
    private toast: ToastService,
    private commonService: CommonService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.modalInstance = new bootstrap.Modal(this.animalGroupModal.nativeElement, { backdrop: 'static' });
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  private initializeForm(): void {
    this.form = this.fb.group({
      farmId: [''],
      animalTypeId: ['', Validators.required],
      animalLactationId: ['', Validators.required],
      animalGroupNameEn: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      animalGroupNameIt: ['', [Validators.minLength(2), Validators.maxLength(50)]],
      numberOfAnimal: ['', [Validators.required, CustomValidators.maxDigits(20)]],
      avgMilkPerDay: ['', [Validators.required, CustomValidators.maxDigits(20)]],
      animalCategoryCode: ['', Validators.required]
    });
  }

  private loadAnimalTypeList(force = false): Observable<any[]> {
    if (!force && this.animalTypes.length > 0) {
      return of(this.animalTypes);
    }
    this.typesLoading = true;
    return this.commonService.getAnimalTypeList().pipe(
      map((res: ApiResponse<any>) => res?.data ?? []),
      tap((data: any[]) => {
        this.animalTypes = Array.isArray(data)
          ? data.map(t => ({ ...t, animalTypeId: t.animalTypeId != null ? String(t.animalTypeId) : '' }))
          : [];
      }),
      catchError((err: ApiResponse<any>) => {
        this.toast.error(err.message);
        return of([]);
      }),
      finalize(() => this.typesLoading = false)
    );
  }

  private loadLactationList(force = false): Observable<any[]> {
    if (!force && this.lactations.length > 0) {
      return of(this.lactations);
    }

    this.lactationsLoading = true;
    return this.commonService.getAnimalLactationStageList().pipe(
      map((res: ApiResponse<any>) => res?.data ?? []),
      tap((data: any[]) => {
        this.lactations = Array.isArray(data)
          ? data.map(l => ({ ...l, animalLactationId: l.animalLactationId != null ? String(l.animalLactationId) : '' }))
          : [];
      }),
      catchError(() => {
        this.toast.error(this.translate.instant('common.failedToLoadAnimalTypes') || 'Failed to load animal types');
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

    if (!this.isAddEditPermission) {
      return;
    }

    const join$ = forkJoin({
      types: this.loadAnimalTypeList(false),
      lactations: this.loadLactationList(false)
    });

    const s = join$.subscribe({
      next: () => {
        if (edit && data) {
          this.form.patchValue({
            animalTypeId: data?.animalTypeId != null ? String(data?.animalTypeId) : '',
            animalLactationId: data?.animalLactationId != null ? String(data?.animalLactationId) : '',
            animalGroupNameEn: data?.animalGroupNameEn,
            animalGroupNameIt: data?.animalGroupNameIt,
            numberOfAnimal: data?.numberOfAnimal,
            avgMilkPerDay: data?.avgMilkPerDay,
            animalCategoryCode: data?.animalCategoryCode
          });
        }
        this.modalInstance.show();
      },
      error: () => {
        this.toast.error(this.translate.instant('common.failedToLoadModal') || 'Failed to load required data to open modal');
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
      this.toast.error(this.translate.instant('common.DoNotPermission') || 'You do not have permission to perform this action');
      return;
    }

    if (!this.form.valid) {
      this.toast.warning(this.translate.instant('common.formInvalid') || 'Please fill all required fields');
      this.form.markAllAsTouched();
      return;
    }

    const payload: any = { ...this.form.getRawValue(), animalGroupId: this.currentAnimalGroupId ?? undefined };

    const sub = (this.isEdit && this.currentAnimalGroupId
      ? this.animalGroupService.updateAnimalGroup(payload)
      : this.animalGroupService.createAnimalGroup(payload))
      .subscribe({
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

  private afterSuccess(): void {
    try {
      this.animalGroupService.notifyanimalGroupsChanged();
    } catch {
    }
    this.closeModal();
  }
}
