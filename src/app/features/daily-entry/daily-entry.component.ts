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

@Component({
  selector: 'app-daily-entry',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, TranslatePipe],
  templateUrl: './daily-entry.component.html',
})
export class DailyEntryComponent implements OnInit, OnDestroy {
  form!: FormGroup;

  dayId = '';
  farmId = '';
  days: any[] = [];
  selectedDate = '';

  animalGroups: any[] = [];
  rations: any[] = [];

  isLoading = false;
  isSaving = false;
  isInitializing = true;

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
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.selectedDate = new Date().toISOString().split('T')[0];
    this.loadDaysAndResolve();
  }

  private loadDaysAndResolve(): void {
    const sub = this.common.getDayList().subscribe({
      next: (days) => {
        this.days = Array.isArray(days?.data) ? days.data : [];
        this.resolveDayAndLoad();
        this.isInitializing = false;
      },
      error: () => {
        this.isInitializing = false;
        this.toast.error('Failed to load day data.');
      }
    });
    this.subs.push(sub);
  }

  private resolveDayAndLoad(): void {
    if (!this.days.length) {
      this.dayId = '';
      this.farmId = '';
      this.loadDependenciesAndBuild(null);
      return;
    }

    const matched = this.days.find((d: any) => this.isMatchingSelectedDate(d));

    if (matched) {
      this.dayId = this.extractDayId(matched);
      this.farmId = this.extractFarmId(matched);
    } else {
      this.dayId = '';
      this.farmId = '';
    }

    this.loadDependenciesAndBuild(this.dayId || null);
  }

  private loadDependenciesAndBuild(dayId: string | null): void {
    this.isLoading = true;

    const requests: any = {
      groups: this.common.getAnimalGroupsList(),
      rations: this.common.getGetAllRationList(),
    };

    if (dayId) {
      requests.existing = this.http.get<any>(`${API_ENDPOINTS.DAY_DATA.GET_BY_DAY_ID}/${dayId}`);
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
        animalGroupId: [g.animalGroupId],
        animalGroupName: [g.animalGroupNameEn],
        rationId: [null],
        headCount: [null],
        scaricatoKg: [null],
        avanzoKg: [null],
        avgProductionKg: [null],
      }));
    });
  }

  private patchForm(data: any): void {
    this.form.patchValue({
      priceType: data.priceType ?? 0,
      gim: data.gim,
      nonMungitura: data.nonMungitura,
      totalCapi: data.totalCapi,
      milkProducedKg: data.milkProducedKg,
      milkDeliveredKg: data.milkDeliveredKg,
      milkPriceEurLitre: data.milkPriceEurLitre,
      fatPercent: data.fatPercent,
      proteinPercent: data.proteinPercent,
      caseinPercent: data.caseinPercent,
      ureaMgDl: data.ureaMgDl,
      somaticCellsThousands: data.somaticCellsThousands,
      qualityBonusEur: data.qualityBonusEur,
      robotCows: data.robotCows,
      robotMilkKg: data.robotMilkKg,
      robotMilkings: data.robotMilkings,
      robotRefusals: data.robotRefusals,
      robotFreeTimeMin: data.robotFreeTimeMin,
      mastitis: data.mastitis ?? 0,
      retentions: data.retentions ?? 0,
      abortions: data.abortions ?? 0,
      calvingsCount: data.calvingsCount ?? 0,
      healthNotes: data.healthNotes,
    });

    if (data.groupData?.length) {
      this.groupData.controls.forEach((ctrl: any) => {
        const match = data.groupData.find(
          (g: any) => g.animalGroupId === ctrl.value.animalGroupId
        );
        if (match) {
          ctrl.patchValue({
            rationId: match.rationId,
            headCount: match.headCount,
            scaricatoKg: match.scaricatoKg,
            avanzoKg: match.avanzoKg,
            avgProductionKg: match.avgProductionKg,
          });
        }
      });
    }
  }

  save(): void {
    if (this.isSaving) return;
    if (!this.isValidGuid(this.dayId)) {
      this.createDayAndSave();
      return;
    }

    this.persistDayData(this.dayId);
  }

  private createDayAndSave(): void {
    this.isSaving = true;

    const sub = this.http.post<any>(API_ENDPOINTS.DAY.CREATE, {
      date: this.selectedDate,
      isClosed: false,
      farmId: null,
    }).subscribe({
      next: (res) => {
        if (!res?.isSuccess) {
          this.toast.error(res?.message ?? this.translate.instant('dailyEntry.messages.saveError'));
          this.isSaving = false;
          return;
        }

        this.refreshDayIdForSelectedDateAndSave();
      },
      error: () => {
        this.toast.error(this.translate.instant('dailyEntry.messages.saveError'));
        this.isSaving = false;
      },
    });

    this.subs.push(sub);
  }

  private refreshDayIdForSelectedDateAndSave(): void {
    const sub = this.common.getDayList().subscribe({
      next: (days) => {
        this.days = Array.isArray(days?.data) ? days.data : [];
        const matched = this.days.find((d: any) => this.isMatchingSelectedDate(d));
        const resolvedDayId = matched ? this.extractDayId(matched) : '';
        const resolvedFarmId = matched ? this.extractFarmId(matched) : '';
        if (!this.isValidGuid(resolvedDayId)) {
          this.toast.error(this.translate.instant('dailyEntry.messages.saveError'));
          this.isSaving = false;
          return;
        }
        if (!this.isValidGuid(resolvedFarmId)) {
          this.toast.error(this.translate.instant('dailyEntry.messages.saveError'));
          this.isSaving = false;
          return;
        }

        this.dayId = resolvedDayId;
        this.farmId = resolvedFarmId;
        this.persistDayData(this.dayId);
      },
      error: () => {
        this.toast.error(this.translate.instant('dailyEntry.messages.saveError'));
        this.isSaving = false;
      },
    });

    this.subs.push(sub);
  }

  private persistDayData(dayId: string): void {
    this.isSaving = true;
    if (!this.isValidGuid(this.farmId)) {
      this.toast.error(this.translate.instant('dailyEntry.messages.saveError'));
      this.isSaving = false;
      return;
    }

    const v = this.form.value;
    const payload = {
      dayId,
      farmId: this.farmId,
      date: this.selectedDate,
      ...v,
      groupData: v.groupData.map((g: any) => ({
        animalGroupId: g.animalGroupId,
        rationId: g.rationId || null,
        headCount: g.headCount,
        scaricatoKg: g.scaricatoKg,
        avanzoKg: g.avanzoKg,
        avgProductionKg: g.avgProductionKg,
      })),
    };

    const sub = this.http.post<any>(API_ENDPOINTS.DAY_DATA.SAVE, payload).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.toast.success(res.message ?? this.translate.instant('dailyEntry.messages.saveSuccess'));
          if (this.isValidGuid(res.data?.dayId)) {
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

  private isValidGuid(value: unknown): value is string {
    return typeof value === 'string'
      && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
  }

  private extractDayId(day: any): string {
    return String(day?.dayId ?? day?.DayId ?? day?.id ?? day?.Id ?? '');
  }

  private extractFarmId(day: any): string {
    return String(day?.farmId ?? day?.FarmId ?? '');
  }

  private isMatchingSelectedDate(day: any): boolean {
    const rawDate = day?.date ?? day?.Date ?? day?.dayDate ?? day?.DayDate ?? day?.dataGiorno ?? '';
    if (!rawDate) {
      return false;
    }

    const normalized = this.normalizeDateString(rawDate);
    return normalized === this.selectedDate;
  }

  private normalizeDateString(value: unknown): string {
    if (!value) {
      return '';
    }

    const text = String(value).trim();
    if (/^\d{4}-\d{2}-\d{2}/.test(text)) {
      return text.slice(0, 10);
    }

    const parsed = new Date(text);
    if (Number.isNaN(parsed.getTime())) {
      return '';
    }

    return parsed.toISOString().slice(0, 10);
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
