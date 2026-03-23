import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Subscription, forkJoin } from 'rxjs';
import { API_ENDPOINTS } from '../../core/constants/api-endpoints';
import { TranslatePipe } from '../../i18n/translate.pipe';
import { TranslateService } from '../../i18n/translate.service';
import { CommonService } from '../../shared/services/common.service';
import { HttpService } from '../../shared/services/http.service';
import { ToastService } from '../../shared/services/toast.service';
import { Store } from '@ngrx/store';
import { take } from 'rxjs/operators';
import { selectAuthUser } from '../../state/auth/auth.selectors';

@Component({
  selector: 'app-daily-entry',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, TranslatePipe],
  templateUrl: './daily-entry.component.html',
})
export class DailyEntryComponent implements OnInit, OnDestroy {
  form!: FormGroup;

  // Farm & day resolution — no query params needed
  farmId = '';
  dayId = '';
  farms: any[] = [];
  days: any[] = [];

  // For admin: show farm selector. For company: auto-set.
  isAdminUser = false;
  selectedFarmId = '';
  selectedDate = '';       // date string 'YYYY-MM-DD'

  animalGroups: any[] = [];
  rations: any[] = [];

  isLoading = false;
  isSaving = false;
  isInitializing = true;  // true while resolving farm + days

  priceTypes = [
    { value: 0, labelKey: 'dailyEntry.priceType.company' },
    { value: 1, labelKey: 'dailyEntry.priceType.market' },
  ];

  private subs: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    private toast: ToastService,
    private common: CommonService,
    private translate: TranslateService,
    private store: Store,
  ) {}

  ngOnInit(): void {
    this.initForm();
    // Set today as default date
    this.selectedDate = new Date().toISOString().split('T')[0];
    this.resolveUserAndFarm();
  }

  // ─────────────────────────────────────────────────────────────
  // Step 1: detect role → resolve farm
  // ─────────────────────────────────────────────────────────────
  private resolveUserAndFarm(): void {
    const sub = this.store.select(selectAuthUser).pipe(take(1)).subscribe(user => {
      const roleType = (user?.roleType ?? '').toUpperCase();
      this.isAdminUser = roleType === 'ADMIN' || user?.isSuperAdmin === true;

      // Load farms + days in parallel
      const farmSub = forkJoin({
        farms: this.common.getFarmsList(),
        days: this.common.getDayList(),
      }).subscribe({
        next: ({ farms, days }) => {
          this.farms = Array.isArray(farms?.data) ? farms.data : [];
          this.days = Array.isArray(days?.data) ? days.data : [];

          if (!this.isAdminUser && this.farms.length > 0) {
            // Company user: auto-select their only farm
            const farmId = this.farms[0]?.farmId;
            if (farmId) {
              this.farmId = farmId;
              this.selectedFarmId = farmId;
              this.resolveDayAndLoad();
            }
          } else if (this.farms.length > 0) {
            // Admin: pre-select first farm, they can change it
            const farmId = this.farms[0]?.farmId;
            if (farmId) {
              this.farmId = farmId;
              this.selectedFarmId = farmId;
              this.resolveDayAndLoad();
            }
          }
          this.isInitializing = false;
        },
        error: () => {
          this.isInitializing = false;
          this.toast.error('Failed to load farm data.');
        }
      });
      this.subs.push(farmSub);
    });
    this.subs.push(sub);
  }

  // ─────────────────────────────────────────────────────────────
  // Step 2: find the TblDay record matching the selected date
  // TblDay has a date field — find the day whose date = selectedDate
  // If none exists for today, use the most recent available day
  // ─────────────────────────────────────────────────────────────
  private resolveDayAndLoad(): void {
    if (!this.days.length) {
      // No days at all — load structure with empty rows
      this.loadDependenciesAndBuild(null);
      return;
    }

    // Try to match selectedDate to a day record
    const matched = this.days.find((d: any) => {
      const dayDate = d?.date ?? d?.dayDate ?? d?.dataGiorno ?? '';
      return dayDate && dayDate.toString().startsWith(this.selectedDate);
    });

    if (matched) {
      this.dayId = String(matched.dayId ?? matched.id ?? '');
    } else {
      // Fall back to most recent day
      const sorted = [...this.days].sort((a: any, b: any) => {
        const da = new Date(a?.date ?? a?.dayDate ?? 0).getTime();
        const db = new Date(b?.date ?? b?.dayDate ?? 0).getTime();
        return db - da;
      });
      this.dayId = String(sorted[0]?.dayId ?? sorted[0]?.id ?? '');
    }

    this.loadDependenciesAndBuild(this.dayId || null);
  }

  // ─────────────────────────────────────────────────────────────
  // Step 3: load animal groups + rations + existing day data
  // ─────────────────────────────────────────────────────────────
  private loadDependenciesAndBuild(dayId: string | null): void {
    this.isLoading = true;

    const requests: any = {
      groups: this.common.getAnimalGroupByFarmID(this.farmId),
      rations: this.common.getGetAllRationList(),
    };

    if (dayId) {
      requests.existing = this.http.get<any>(
        `${API_ENDPOINTS.DAY_DATA.GET_BY_DAY_ID}/${dayId}`
      );
    }

    const sub = forkJoin(requests).subscribe({
      next: (res: any) => {
        this.animalGroups = res.groups?.data ?? [];
        this.rations = res.rations?.data ?? [];
        this.buildGroupRows();
        if (res.existing?.data) {
          this.patchForm(res.existing.data);
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.buildGroupRows();
      },
    });

    this.subs.push(sub);
  }

  // Called when admin changes farm selector
  onFarmChange(): void {
    this.farmId = this.selectedFarmId;
    this.dayId = '';
    this.form.reset();
    this.initForm();
    this.resolveDayAndLoad();
  }

  // Called when date picker changes
  onDateChange(): void {
    this.resolveDayAndLoad();
  }

  initForm(): void {
    this.form = this.fb.group({
      priceType: [0],
      gim: [null],
      nonMungitura: [null],
      totalCapi: [null],
      milkProducedKg: [null],
      milkDeliveredKg: [null],
      milkPriceEurLitre: [null],
      fatPercent: [null],
      proteinPercent: [null],
      caseinPercent: [null],
      ureaMgDl: [null],
      somaticCellsThousands: [null],
      qualityBonusEur: [null],
      robotCows: [null],
      robotMilkKg: [null],
      robotMilkings: [null],
      robotRefusals: [null],
      robotFreeTimeMin: [null],
      mastitis: [0],
      retentions: [0],
      abortions: [0],
      calvingsCount: [0],
      healthNotes: [null],
      groupData: this.fb.array([]),
    });
  }

  get groupData(): FormArray {
    return this.form.get('groupData') as FormArray;
  }

  private buildGroupRows(): void {
    const fa = this.groupData;
    while (fa.length) fa.removeAt(0);

    this.animalGroups.forEach((g) => {
      fa.push(this.fb.group({
        animalGroupId:   [g.animalGroupId],
        animalGroupName: [g.animalGroupNameEn],
        rationId:        [null],
        headCount:       [null],
        scaricatoKg:     [null],
        avanzoKg:        [null],
        avgProductionKg: [null],
      }));
    });
  }

  private patchForm(data: any): void {
    this.form.patchValue({
      priceType:            data.priceType ?? 0,
      gim:                  data.gim,
      nonMungitura:         data.nonMungitura,
      totalCapi:            data.totalCapi,
      milkProducedKg:       data.milkProducedKg,
      milkDeliveredKg:      data.milkDeliveredKg,
      milkPriceEurLitre:    data.milkPriceEurLitre,
      fatPercent:           data.fatPercent,
      proteinPercent:       data.proteinPercent,
      caseinPercent:        data.caseinPercent,
      ureaMgDl:             data.ureaMgDl,
      somaticCellsThousands:data.somaticCellsThousands,
      qualityBonusEur:      data.qualityBonusEur,
      robotCows:            data.robotCows,
      robotMilkKg:          data.robotMilkKg,
      robotMilkings:        data.robotMilkings,
      robotRefusals:        data.robotRefusals,
      robotFreeTimeMin:     data.robotFreeTimeMin,
      mastitis:             data.mastitis ?? 0,
      retentions:           data.retentions ?? 0,
      abortions:            data.abortions ?? 0,
      calvingsCount:        data.calvingsCount ?? 0,
      healthNotes:          data.healthNotes,
    });

    if (data.groupData?.length) {
      this.groupData.controls.forEach((ctrl: any) => {
        const match = data.groupData.find(
          (g: any) => g.animalGroupId === ctrl.value.animalGroupId
        );
        if (match) {
          ctrl.patchValue({
            rationId:        match.rationId,
            headCount:       match.headCount,
            scaricatoKg:     match.scaricatoKg,
            avanzoKg:        match.avanzoKg,
            avgProductionKg: match.avgProductionKg,
          });
        }
      });
    }
  }

  save(): void {
    if (this.isSaving) return;
    this.isSaving = true;

    const v = this.form.value;
    const payload = {
      dayId:    this.dayId || null,
      farmId:   this.farmId,
      date:     this.selectedDate,
      ...v,
      groupData: v.groupData.map((g: any) => ({
        animalGroupId:   g.animalGroupId,
        rationId:        g.rationId || null,
        headCount:       g.headCount,
        scaricatoKg:     g.scaricatoKg,
        avanzoKg:        g.avanzoKg,
        avgProductionKg: g.avgProductionKg,
      })),
    };

    const sub = this.http.post<any>(API_ENDPOINTS.DAY_DATA.SAVE, payload).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.toast.success(res.message ?? this.translate.instant('dailyEntry.messages.saveSuccess'));
          // Reload to pick up any server-computed values (IOFC etc)
          if (res.data?.dayId) {
            this.dayId = res.data.dayId;
          }
        } else {
          this.toast.error(res.message);
        }
        this.isSaving = false;
      },
      error: () => {
        this.toast.error(this.translate.instant('dailyEntry.messages.saveError'));
        this.isSaving = false;
      },
    });

    this.subs.push(sub);
  }

  // Display helpers
  getDayLabel(day: any): string {
    return day?.date || day?.dayName || day?.name || day?.label || day?.dayId || '';
  }

  getDayValue(day: any): string {
    return String(day?.dayId ?? day?.id ?? '');
  }

  get selectedDateLabel(): string {
    if (!this.selectedDate) return '';
    const d = new Date(this.selectedDate);
    return d.toLocaleDateString('it-IT', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }
}