import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, forkJoin } from 'rxjs';
import { API_ENDPOINTS } from '../../core/constants/api-endpoints';
import { FarmList } from '../../core/models/farm-list';
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
  farmId!: string;
  dayId!: string;
  selectedFarmId = '';
  selectedDayId = '';
  animalGroups: any[] = [];
  rations: any[] = [];
  farms: FarmList[] = [];
  days: any[] = [];
  isLoading = false;
  isSaving = false;
  isSelectionLoading = false;
  needsSelection = false;
  priceTypes = [
    { value: 0, labelKey: 'dailyEntry.priceType.company' },
    { value: 1, labelKey: 'dailyEntry.priceType.market' },
  ];
  private subs: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpService,
    private toast: ToastService,
    private common: CommonService,
    private translate: TranslateService,
  ) {}

  ngOnInit(): void {
    this.initForm();

    const sub = this.route.queryParams.subscribe((params) => {
      this.farmId = params['farmId'];
      this.dayId = params['dayId'];

      if (!this.farmId || !this.dayId) {
        this.needsSelection = true;
        this.loadSelectionOptions();
        return;
      }

      this.needsSelection = false;
      this.selectedFarmId = this.farmId;
      this.selectedDayId = this.dayId;
      this.loadDependencies();
    });

    this.subs.push(sub);
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

  private loadSelectionOptions(): void {
    this.isSelectionLoading = true;

    const sub = forkJoin({
      farms: this.common.getFarmsList(),
      days: this.common.getDayList(),
    }).subscribe({
      next: ({ farms, days }) => {
        this.farms = Array.isArray(farms?.data) ? farms.data : [];
        this.days = Array.isArray(days?.data) ? days.data : [];
        this.isSelectionLoading = false;
      },
      error: () => {
        this.farms = [];
        this.days = [];
        this.isSelectionLoading = false;
        this.toast.error(this.translate.instant('dailyEntry.messages.loadSelectionError'));
      },
    });

    this.subs.push(sub);
  }

  openSelectedEntry(): void {
    if (!this.selectedFarmId || !this.selectedDayId) {
      this.toast.warning(this.translate.instant('dailyEntry.messages.selectFarmAndDay'));
      return;
    }

    this.router.navigate(['/daily-entry'], {
      queryParams: {
        farmId: this.selectedFarmId,
        dayId: this.selectedDayId,
      },
    });
  }

  private loadDependencies(): void {
    this.isLoading = true;

    const sub = forkJoin({
      groups: this.common.getAnimalGroupByFarmID(this.farmId),
      rations: this.common.getGetAllRationList(),
      existing: this.http.get<any>(
        `${API_ENDPOINTS.DAY_DATA.GET_BY_DAY_ID}/${this.dayId}`,
      ),
    }).subscribe({
      next: ({ groups, rations, existing }) => {
        this.animalGroups = groups?.data ?? [];
        this.rations = rations?.data ?? [];
        this.buildGroupRows();
        if (existing?.data) {
          this.patchForm(existing.data);
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

  private buildGroupRows(): void {
    const fa = this.groupData;
    while (fa.length) {
      fa.removeAt(0);
    }

    this.animalGroups.forEach((g) => {
      fa.push(
        this.fb.group({
          animalGroupId: [g.animalGroupId],
          animalGroupName: [g.animalGroupNameEn],
          rationId: [null],
          headCount: [null],
          scaricatoKg: [null],
          avanzoKg: [null],
          avgProductionKg: [null],
        }),
      );
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
          (g: any) => g.animalGroupId === ctrl.value.animalGroupId,
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
    if (this.isSaving) {
      return;
    }

    this.isSaving = true;
    const v = this.form.value;
    const payload = {
      dayId: this.dayId,
      farmId: this.farmId,
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
          this.toast.success(
            res.message ?? this.translate.instant('dailyEntry.messages.saveSuccess'),
          );
          this.router.navigate(['/farm']);
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

  goBack(): void {
    this.router.navigate(['/farm']);
  }

  getDayLabel(day: any): string {
    return (
      day?.date ||
      day?.dayName ||
      day?.name ||
      day?.label ||
      day?.kpiName ||
      day?.Kpiname ||
      day?.dayId ||
      ''
    );
  }

  getDayValue(day: any): string {
    return String(day?.dayId ?? day?.id ?? day?.Kpiid ?? '');
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }
}
