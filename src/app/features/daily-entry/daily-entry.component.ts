import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription, forkJoin, merge } from 'rxjs';
import { debounceTime, map } from 'rxjs/operators';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { API_ENDPOINTS } from '../../core/constants/api-endpoints';
import { Constants } from '../../shared/utils/constants/constants';
import { PERMISSIONS } from '../../core/constants/permissions.constants';
import { TranslatePipe } from '../../i18n/translate.pipe';
import { TranslateService } from '../../i18n/translate.service';
import { CommonService } from '../../shared/services/common.service';
import { HttpService } from '../../shared/services/http.service';
import { ToastService } from '../../shared/services/toast.service';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-daily-entry',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, TranslatePipe, MatPaginatorModule, DragDropModule],
  templateUrl: './daily-entry.component.html',
  styleUrl: './daily-entry.component.css',
})
export class DailyEntryComponent implements OnInit, OnDestroy {
  form!: FormGroup;

  dayId = '';
  farmId = '';
  days: any[] = [];
  selectedDate = '';

  allGroups: any[] = [];            // full ordered list (all groups, no server paging)
  savedGroupOrder: string[] = [];   // group IDs in user-preferred order
  pagedGroupsWithIdx: { group: any; faIdx: number }[] = [];
  totalAnimalGroupRecords = 0;
  isGroupLoading = false;
  private groupValueCache = new Map<string, any>(); // groupId → last-known form values

  rations: any[] = [];

  isLoading = false;
  isSaving = false;
  isInitializing = true;
  canSave = false;

  isSuperAdmin = false;
  companies: { id: string; name: string }[] = [];
  selectedCompanyId = '';
  private pendingRouteDayId = '';
  private pendingRouteDate = '';

  // Pagination & Sorting (API Level)
  pageSize = 5;
  pageIndex = 0;
  sortColumn = 'animalGroupNameEn';
  sortDirection: 'asc' | 'desc' = 'asc';
  sortableColumns: string[] = [
    'animalGroupNameEn',
    'animalCategoryCode',
  ];

  sections: any[] = [
    { id: 'feeding' },
    { id: 'milk' },
    { id: 'robot' },
    { id: 'health' },
    { id: 'herd' },
    { id: 'calves' },
    { id: 'fertility' }
  ];

  categoryMap: any = {
    VL: { en: 'Lactating Cows', it: 'Vacche in lattazione' },
    AS: { en: 'Dry Cows', it: 'Vacche asciutte' },
    MA: { en: 'Heifers', it: 'Manze' },
    MZ: { en: 'Young Cattle', it: 'Manzette' },
    VI: { en: 'Calves', it: 'Vitelli' }
  };

  // Column Filters
  columnFilters: { [key: string]: string } = {
    animalGroupNameEn: '',
    animalCategoryCode: '',
  };

  // Ration search filter
  rationFilter = '';
  filteredRations: any[] = [];
  openRationDropdownIndex: number | null = null;
  private lastEditedMilkField: 'delivered' | 'produced' | 'avg' | null = null;

  get groupData(): FormArray {
    return this.form.get('groupData') as FormArray;
  }

  get totalPages(): number {
    return Math.ceil(this.totalAnimalGroupRecords / this.pageSize);
  }

  get pageStartRecord(): number {
    return this.pageIndex * this.pageSize + 1;
  }

  get pageEndRecord(): number {
    return Math.min((this.pageIndex + 1) * this.pageSize, this.totalAnimalGroupRecords);
  }

  priceTypes = [
    { value: 0, labelKey: 'dailyEntry.priceType.company' },
    { value: 1, labelKey: 'dailyEntry.priceType.market' },
  ];

  private subs: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private http: HttpService,
    private toast: ToastService,
    private common: CommonService,
    private translate: TranslateService,
  ) { }

  t(key: string, fallback: string): string {
    const translated = this.translate.instant(key);
    return translated && translated !== key ? translated : fallback;
  }

  toggleManual(manualControlName: string, input?: HTMLInputElement | null): void {
    const manualCtrl = this.form?.get(manualControlName);
    if (!manualCtrl) {
      return;
    }

    const next = !manualCtrl.value;
    manualCtrl.setValue(next);

    if (next) {
      setTimeout(() => input?.focus(), 0);
      return;
    }

    // When turning manual mode off, re-apply auto-calculated values.
    this.recalculateDerivedFields();
  }

  ngOnInit(): void {
    this.initForm();
    this.setupMilkTracking();
    this.setupDerivedFieldCalculations();
    this.isSuperAdmin = localStorage.getItem(Constants.IsSuperAdmin) === 'true';
    this.canSave = this.common.hasAnyPermission(
      [PERMISSIONS.DailyEntryAdd, PERMISSIONS.DailyEntryEdit],
      false
    );
    if (!this.common.checkPermission(PERMISSIONS.DailyEntryView, false)) {
      this.isInitializing = false;
      return;
    }

    this.selectedDate = this.getTodayString();
    this.initializeRouteSelection();
    if (this.isSuperAdmin) {
      this.loadCompanies();
    } else {
      this.loadDaysAndResolve();
    }

    this.loadLayout();
    this.groupData.valueChanges.subscribe(() => {
      this.calculateInLactation();
      this.calculateTotalHeads();
    });
    this.setupPregnantCalculation();

    this.form.get('dryAnimals')?.valueChanges.subscribe(() => {
      this.calculateTotalHeads();
    });
    this.setupFertilityCalculation();
    this.setupFertilityValidation();
  }


  drop(event: CdkDragDrop<any[]>) {
    moveItemInArray(this.sections, event.previousIndex, event.currentIndex);
    this.saveLayout();
  }

  dropGroup(event: CdkDragDrop<any[]>): void {
    if (event.previousIndex === event.currentIndex) return;

    // Map visual (page-local) indices → global FormArray / allGroups indices
    const page      = this.pagedGroupsWithIdx;
    const globalPrev = page[event.previousIndex]?.faIdx;
    const globalCurr = page[event.currentIndex]?.faIdx;
    if (globalPrev == null || globalCurr == null) return;

    // 1. Reorder the full list (drives future computePagedGroups + order persistence)
    moveItemInArray(this.allGroups, globalPrev, globalCurr);

    // 2. Reorder FormArray controls in sync (keeps all entered values intact)
    const fa      = this.groupData;
    const control = fa.at(globalPrev);
    fa.removeAt(globalPrev);
    fa.insert(globalCurr, control);

    // 3. Recompute the visible page (indices shift after move)
    this.computePagedGroups();

    // 4. Persist the new order to the backend so it survives logout/reload
    this.saveGroupOrder();
  }

  saveLayout() {
    const layout = this.sections.map(s => s.id);

    this.common.saveUserLayout({
      pageName: 'DailyEntry',
      layoutJson: JSON.stringify(layout)
    }).subscribe();
  }

  loadLayout() {
    this.common.getUserLayout('DailyEntry').subscribe((res: any) => {
      if (res?.data) {
        const saved = JSON.parse(res.data);
        this.sections.sort((a, b) => {
          const ia = saved.indexOf(a.id);
          const ib = saved.indexOf(b.id);
          return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
        });
      }
    });

    this.common.getUserLayout('DailyEntry-Groups').subscribe((res: any) => {
      if (res?.data) {
        try { this.savedGroupOrder = JSON.parse(res.data); } catch { this.savedGroupOrder = []; }
      }
    });
  }



  private loadCompanies(): void {
    const sub = this.common.getCompanyDropdown().subscribe({
      next: (res) => {
        this.companies = res?.data ?? [];
        if (this.companies.length > 0) {
          this.selectedCompanyId = this.companies[0].id;
        }
        this.loadDaysAndResolve();
        this.isInitializing = false;
      },
      error: () => {
        this.isInitializing = false;
        this.loadDaysAndResolve();
      }
    });
    this.subs.push(sub);
  }

  onCompanyChange(): void {
    this.dayId = '';
    this.farmId = '';
    this.loadDaysAndResolve();
  }

  private loadDaysAndResolve(): void {
    const cid = this.isSuperAdmin && this.selectedCompanyId ? this.selectedCompanyId : undefined;
    const sub = this.common.getDayList(cid).subscribe({
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
    const routeDayId = this.pendingRouteDayId;
    const routeDate = this.pendingRouteDate;
    this.pendingRouteDayId = '';
    this.pendingRouteDate = '';

    if (routeDate) {
      this.selectedDate = routeDate;
    }

    if (!this.days.length) {
      this.dayId = '';
      this.farmId = '';
      this.loadDependenciesAndBuild(this.isValidGuid(routeDayId) ? routeDayId : null);
      return;
    }

    const matchedByRouteDayId = this.isValidGuid(routeDayId)
      ? this.days.find((d: any) => this.extractDayId(d) === routeDayId)
      : null;
    const matched = matchedByRouteDayId ?? this.days.find((d: any) => this.isMatchingSelectedDate(d));

    if (matched) {
      this.dayId = this.extractDayId(matched);
      this.farmId = this.extractFarmId(matched);
      const matchedDate = this.extractDayDate(matched);
      if (matchedDate) {
        this.selectedDate = matchedDate;
      }
    } else {
      this.dayId = '';
      this.farmId = '';
    }

    this.loadDependenciesAndBuild(this.dayId || (this.isValidGuid(routeDayId) ? routeDayId : null));
  }

  private loadDependenciesAndBuild(dayId: string | null): void {
    this.isInitializing = true;
    const cid = this.isSuperAdmin && this.selectedCompanyId ? this.selectedCompanyId : undefined;

    // Load ALL groups without server-side pagination — order and filtering are done client-side
    const requests: any = {
      groups: this.common.getAnimalGroupsList(cid, {
        pageNo: 1,
        recordPerPage: 9999,
        sortColumn: 'animalGroupNameEn',
        sortDirection: 'asc',
        columnFilters: [],
      }),
      rations: this.common.getGetAllRationList(cid),
    };

    if (dayId) {
      requests.existing = this.http.get<any>(`${API_ENDPOINTS.DAY_DATA.GET_BY_DAY_ID}/${dayId}`);
    }

    const sub = forkJoin(requests).subscribe({
      next: (res: any) => {
        const raw: any[] = res.groups?.data ?? [];
        this.allGroups = this.applyGroupOrder(raw);
        this.groupValueCache.clear();
        this.rations = res.rations?.data ?? [];
        this.filteredRations = [...this.rations];
        this.rationFilter = '';
        this.buildGroupRows();

        if (res.existing?.data) {
          this.farmId = this.farmId || this.extractFarmId(res.existing.data);
          const existingDate = this.extractDayDate(res.existing.data);
          if (existingDate) this.selectedDate = existingDate;
          this.patchForm(res.existing.data);
          setTimeout(() => {
            this.calculateInLactation();
            this.calculateTotalHeads();
          }, 0);
        }

        this.computePagedGroups();
        this.isInitializing = false;
        this.isSaving = false;
      },
      error: () => {
        this.isInitializing = false;
        this.isSaving = false;
        this.buildGroupRows();
        this.computePagedGroups();
      },
    });

    this.subs.push(sub);
  }

  private applyGroupOrder(groups: any[]): any[] {
    if (!this.savedGroupOrder.length) return groups;
    const orderMap = new Map(this.savedGroupOrder.map((id, i) => [id, i]));
    return [...groups].sort((a, b) =>
      (orderMap.get(a.animalGroupId) ?? 9999) - (orderMap.get(b.animalGroupId) ?? 9999)
    );
  }

  private computePagedGroups(): void {
    let groups = this.allGroups;
    const nameF = (this.columnFilters['animalGroupNameEn'] ?? '').toLowerCase();
    const catF  = (this.columnFilters['animalCategoryCode'] ?? '');
    if (nameF) groups = groups.filter(g => (g.animalGroupNameEn ?? '').toLowerCase().includes(nameF));
    if (catF)  groups = groups.filter(g => g.animalCategoryCode === catF);

    this.totalAnimalGroupRecords = groups.length;
    const start = this.pageIndex * this.pageSize;
    this.pagedGroupsWithIdx = groups
      .slice(start, start + this.pageSize)
      .map(g => ({ group: g, faIdx: this.allGroups.indexOf(g) }));
  }

  private syncGroupCache(): void {
    this.allGroups.forEach((g, idx) => {
      if (idx < this.groupData.length) {
        const v = this.groupData.at(idx).value;
        this.groupValueCache.set(g.animalGroupId, {
          rationId: v.rationId,
          headCount: v.headCount,
          scaricatoKg: v.scaricatoKg,
          avanzoKg: v.avanzoKg,
          avgProductionKg: v.avgProductionKg,
        });
      }
    });
  }

  private sortAllGroupsClientSide(): void {
    this.allGroups.sort((a, b) => {
      const va = ((a as any)[this.sortColumn] ?? '').toString().toLowerCase();
      const vb = ((b as any)[this.sortColumn] ?? '').toString().toLowerCase();
      return this.sortDirection === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
    });
  }

  private saveGroupOrder(): void {
    const order = this.allGroups.map(g => g.animalGroupId);
    this.common.saveUserLayout({
      pageName: 'DailyEntry-Groups',
      layoutJson: JSON.stringify(order),
    }).subscribe();
  }

  onDateChange(): void {
    this.resolveDayAndLoad();
  }

  onRationFilterChange(value: string): void {
    this.rationFilter = value.toLowerCase();
    this.filteredRations = this.rations.filter(r =>
      r.rationName?.toLowerCase().includes(this.rationFilter)
    );
  }

  toggleRationDropdown(index: number): void {
    this.openRationDropdownIndex = this.openRationDropdownIndex === index ? null : index;
    if (this.openRationDropdownIndex === index) {
      this.rationFilter = '';
      this.filteredRations = [...this.rations];
    }
  }

  updateRationFilter(event: any, index: number): void {
    const value = event.target.value;
    this.rationFilter = value.toLowerCase();
    this.filteredRations = this.rations.filter(r =>
      r.rationName?.toLowerCase().includes(this.rationFilter)
    );
  }

  selectRation(ration: any, index: number): void {
    const rationId = ration ? ration.rationId : null;
    this.groupData.at(index)?.get('rationId')?.setValue(rationId);
    this.openRationDropdownIndex = null;
    this.rationFilter = '';
  }

  getSelectedRationName(rationId: any): string {
    const labelKey = 'dailyEntry.placeholders.selectRation';
    const fallback = 'Select Ration';
    const translated = this.translate.instant(labelKey);
    const emptyLabel = translated && translated !== labelKey ? translated : fallback;
    if (!rationId) {
      return emptyLabel;
    }
    const selected = this.rations.find(r => r.rationId === rationId);
    return selected ? selected.rationName : emptyLabel;
  }

  initForm(): void {
    this.form = this.fb.group({
      priceType: [0],
      groupData: this.fb.array([]),
      categoryCode: [null],
      gim: [null],
      nonMungitura: [null],
      totalCapi: [null],
      animalsInLactation: [null],
      dryAnimals: [null],
      firstCalving: [null],
      secondCalving: [null],
      multiparous: [null],
      pregnantCows: [null],
      firstCalvingPct: [null],
      pregnantCowsPct: [null],
      crep: [null],
      firstCalvingPctManual: [false],
      pregnantCowsPctManual: [false],
      crepManual: [false],
      milkProducedKg: [null],
      milkDeliveredKg: [null],
      avgMilkPerHead: [null],
      milkPriceEurLitre: [null],
      fatPercent: [null],
      proteinPercent: [null],
      caseinPercent: [null],
      lactose: [null],
      ureaMgDl: [null],
      somaticCellsThousands: [null],
      qualityBonusEur: [null],
      robotCows: [null],
      robotMilkKg: [null],
      robotMilkings: [null],
      robotRefusals: [null],
      robotFreeTimeMin: [null],
      avgFeed: [null],
      indAvgFeed: [null],
      indAvgMilk: [null],
      grpAvgFeed: [null],
      grpAvgMilk: [null],
      totalHeads: [null],
      inLactation: [null],
      indAnimals: [null],
      indPowder: [null],
      grpAnimals: [null],
      grpPowder: [null],
      mastitis: [0],
      retentions: [0],
      abortions: [0],
      calvingsCount: [0],
      healthNotes: [null],
      cowDiagnoses: [null],
      positiveCows: [null],
      heiferDiagnoses: [null],
      positiveHeifers: [null],
      conceptionAtCalving: [null],
      calvingInterval: [null],
      ageAtCalving: [null],
      cowDiagnosesPct: [null],
      heiferDiagnosesPct: [null],
    });
  }

  private buildGroupRows(): void {
    const fa = this.groupData;
    while (fa.length) fa.removeAt(0);

    this.allGroups.forEach((g) => {
      const cached = this.groupValueCache.get(g.animalGroupId) ?? {};
      fa.push(this.fb.group({
        animalGroupId:      [g.animalGroupId],
        animalGroupName:    [g.animalGroupNameEn],
        animalCategoryCode: [this.normalizeCategoryCode(g.animalCategoryCode)],
        rationId:           [cached.rationId      ?? null],
        headCount:          [cached.headCount      ?? null],
        scaricatoKg:        [cached.scaricatoKg    ?? null],
        avanzoKg:           [cached.avanzoKg       ?? null],
        avgProductionKg:    [cached.avgProductionKg ?? null],
      }));
    });
  }

  private patchForm(data: any): void {
    this.form.patchValue({
      priceType: data.priceType ?? 0,
      categoryCode: data.categoryCode,
      gim: data.gim,
      nonMungitura: data.nonMungitura,
      totalCapi: data.totalCapi,
      animalsInLactation: data.animalsInLactation,
      dryAnimals: data.dryAnimals,
      firstCalving: data.firstCalving,
      secondCalving: data.secondCalving,
      multiparous: data.multiparous,
      pregnantCows: data.pregnantCows,
      firstCalvingPct: data.firstCalvingPct,
      pregnantCowsPct: data.pregnantCowsPct,
      crep: data.crep,
      firstCalvingPctManual: data.isFirstCalvingManual ?? data.firstCalvingPctManual ?? false,
      pregnantCowsPctManual: data.isPregnantManual ?? data.pregnantCowsPctManual ?? false,
      crepManual: data.crepManual ?? false,
      milkProducedKg: data.milkProducedKg,
      milkDeliveredKg: data.milkDeliveredKg,
      avgMilkPerHead: data.avgMilkPerHead,
      milkPriceEurLitre: data.milkPriceEurLitre,
      fatPercent: data.fatPercent,
      proteinPercent: data.proteinPercent,
      caseinPercent: data.caseinPercent,
      lactose: data.lactose,
      ureaMgDl: data.ureaMgDl,
      somaticCellsThousands: data.somaticCellsThousands,
      qualityBonusEur: data.qualityBonusEur,
      robotCows: data.robotCows,
      robotMilkKg: data.robotMilkKg,
      robotMilkings: data.robotMilkings,
      robotRefusals: data.robotRefusals,
      robotFreeTimeMin: data.robotFreeTimeMin,
      avgFeed: data.avgFeed,
      indAvgFeed: data.indAvgFeed,
      indAvgMilk: data.indAvgMilk,
      grpAvgFeed: data.grpAvgFeed,
      grpAvgMilk: data.grpAvgMilk,
      totalHeads: data.totalHeads,
      inLactation: data.inLactation,
      indAnimals: data.indAnimals,
      indPowder: data.indPowder,
      grpAnimals: data.grpAnimals,
      grpPowder: data.grpPowder,
      mastitis: data.mastitis ?? 0,
      retentions: data.retentions ?? 0,
      abortions: data.abortions ?? 0,
      calvingsCount: data.calvingsCount ?? 0,
      healthNotes: data.healthNotes,
      cowDiagnoses: data.cowDiagnoses,
      positiveCows: data.positiveCows,
      heiferDiagnoses: data.heiferDiagnoses,
      positiveHeifers: data.positiveHeifers,
      conceptionAtCalving: data.conceptionAtCalving,
      calvingInterval: data.calvingInterval,
      ageAtCalving: data.ageAtCalving,
    });

    if (data.groupData?.length) {
      // Populate cache so buildGroupRows() (and rebuilds after sort) restore values
      data.groupData.forEach((g: any) => {
        this.groupValueCache.set(g.animalGroupId, {
          rationId:       g.rationId,
          headCount:      g.headCount,
          scaricatoKg:    g.scaricatoKg,
          avanzoKg:       g.avanzoKg,
          avgProductionKg: g.avgProductionKg,
        });
      });

      // Patch the live FormArray controls directly
      this.groupData.controls.forEach((ctrl: any) => {
        const match = data.groupData.find(
          (g: any) => g.animalGroupId === ctrl.value.animalGroupId
        );
        if (match) {
          const normalizedCategory = this.normalizeCategoryCode(match.categoryCode ?? match.animalCategoryCode);
          ctrl.patchValue({
            rationId:          match.rationId,
            headCount:         match.headCount,
            scaricatoKg:       match.scaricatoKg,
            avanzoKg:          match.avanzoKg,
            avgProductionKg:   match.avgProductionKg,
            animalCategoryCode: normalizedCategory ?? ctrl.value.animalCategoryCode,
          });
        }
      });
    }
  }

  save(): void {
    if (!this.common.hasAnyPermission([PERMISSIONS.DailyEntryAdd, PERMISSIONS.DailyEntryEdit])) {
      return;
    }
    if (this.isSaving) return;
    if (!this.isValidGuid(this.dayId)) {
      this.createDayAndSave();
      return;
    }

    this.persistDayData(this.dayId);
  }

  private createDayAndSave(): void {
    this.isSaving = true;

    const payload: any = { date: this.selectedDate, isClosed: false, farmId: null };
    if (this.isSuperAdmin && this.selectedCompanyId) {
      payload['companyId'] = this.selectedCompanyId;

    }
    const sub = this.http.post<any>(API_ENDPOINTS.DAY.CREATE, payload).subscribe({
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

  private setupFertilityCalculation(): void {
    const cowDiag = this.form.get('cowDiagnoses');
    const posCows = this.form.get('positiveCows');

    const heiferDiag = this.form.get('heiferDiagnoses');
    const posHeifers = this.form.get('positiveHeifers');

    // cows % calculation
    cowDiag?.valueChanges.subscribe(() => {
      this.calculateFertility();
    });

    posCows?.valueChanges.subscribe(() => {
      this.calculateFertility();
    });

    heiferDiag?.valueChanges.subscribe(() => {
      this.calculateFertility();
    });


    posHeifers?.valueChanges.subscribe(() => {
      this.calculateFertility();
    });
    
  }

  private setupFertilityValidation(): void {
  const posCows = this.form.get('positiveCows');
  const cowDiag = this.form.get('cowDiagnoses');

  const posHeifers = this.form.get('positiveHeifers');
  const heiferDiag = this.form.get('heiferDiagnoses');

  posCows?.valueChanges.subscribe(val => {
    if (val > (cowDiag?.value || 0)) {
      posCows.setErrors({ invalid: true });
    } else {
      posCows.setErrors(null);
    }
  });

  posHeifers?.valueChanges.subscribe(val => {
    if (val > (heiferDiag?.value || 0)) {
      posHeifers.setErrors({ invalid: true });
    } else {
      posHeifers.setErrors(null);
    }
  });
}
private calculateFertility(): void {
  const cowDiag = this.form.get('cowDiagnoses')?.value || 0;
  const posCows = this.form.get('positiveCows')?.value || 0;

  const heiferDiag = this.form.get('heiferDiagnoses')?.value || 0;
  const posHeifers = this.form.get('positiveHeifers')?.value || 0;

  const cowPct = cowDiag > 0 ? (posCows / cowDiag) * 100 : 0;
  const heiferPct = heiferDiag > 0 ? (posHeifers / heiferDiag) * 100 : 0;

  this.form.get('cowDiagnosesPct')?.setValue(+cowPct.toFixed(2), { emitEvent: false });
  this.form.get('heiferDiagnosesPct')?.setValue(+heiferPct.toFixed(2), { emitEvent: false });
}





  private setupPregnantCalculation(): void {
    const cowsCtrl = this.form.get('pregnantCows');
    const pctCtrl = this.form.get('pregnantCowsPct');
    const totalCtrl = this.form.get('totalHeads');

    // cows → %
    cowsCtrl?.valueChanges.subscribe(val => {
      if (this.form.get('pregnantCowsPctManual')?.value) return;

      const total = totalCtrl?.value || 0;
      if (total > 0) {
        pctCtrl?.setValue(+((val / total) * 100).toFixed(2), { emitEvent: false });
      }
    });

    // % → cows
    pctCtrl?.valueChanges.subscribe(val => {
      if (!this.form.get('pregnantCowsPctManual')?.value) return;

      const total = totalCtrl?.value || 0;
      if (total > 0) {
        cowsCtrl?.setValue(Math.round((val * total) / 100), { emitEvent: false });
      }
    });

    // totalHeads change → recalc
    totalCtrl?.valueChanges.subscribe(() => {
      const total = totalCtrl.value || 0;
      const cows = cowsCtrl?.value || 0;
      const pct = pctCtrl?.value || 0;

      if (!this.form.get('pregnantCowsPctManual')?.value && total > 0) {
        pctCtrl?.setValue(+((cows / total) * 100).toFixed(2), { emitEvent: false });
      }

      if (this.form.get('pregnantCowsPctManual')?.value && total > 0) {
        cowsCtrl?.setValue(Math.round((pct * total) / 100), { emitEvent: false });
      }
    });
  }

  private calculateInLactation(): void {
    const totalVL = this.groupData.value
      .filter((g: any) => g.animalCategoryCode === 'VL')
      .reduce((sum: number, g: any) => sum + (g.headCount || 0), 0);

    this.form.get('inLactation')?.setValue(totalVL, { emitEvent: false });
  }
  private calculateTotalHeads(): void {
    const inLactation = this.form.get('inLactation')?.value || 0;
    const dry = this.form.get('dryAnimals')?.value || 0;

    this.form.get('totalHeads')?.setValue(inLactation + dry, { emitEvent: false });
  }

  private refreshDayIdForSelectedDateAndSave(): void {
    const cid = this.isSuperAdmin && this.selectedCompanyId ? this.selectedCompanyId : undefined;
    const sub = this.common.getDayList(cid).subscribe({
      next: (days) => {
        this.days = Array.isArray(days?.data) ? days.data : [];
        const matched = this.days.find((d: any) => this.isMatchingSelectedDate(d));
        const resolvedDayId = matched ? this.extractDayId(matched) : '';
        if (!this.isValidGuid(resolvedDayId)) {
          this.toast.error(this.translate.instant('dailyEntry.messages.saveError'));
          this.isSaving = false;
          return;
        }

        this.dayId = resolvedDayId;
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

    const v = this.form.value;
    const {
      firstCalvingPctManual,
      pregnantCowsPctManual,
      crepManual,
      ...rest
    } = v as any;

    const manualFlags = {
      // backend (System.Text.Json camelCase) expects: isFirstCalvingManual, isPregnantManual
      isFirstCalvingManual: !!firstCalvingPctManual,
      isPregnantManual: !!pregnantCowsPctManual,
      // keep crep manual UI-only for now (backend may ignore)
      crepManual: !!crepManual,
    };

    const normalizedTotals = {
      totalHeads: rest.totalHeads ?? rest.totalCapi ?? null,
      inLactation: rest.inLactation ?? rest.animalsInLactation ?? null,
    };
    const payload: any = {
      dayId,
      farmId: this.farmId || '00000000-0000-0000-0000-000000000000',
      date: this.selectedDate,
      ...(this.isSuperAdmin && this.selectedCompanyId ? { tenantId: this.selectedCompanyId } : {}),
      ...rest,
      ...normalizedTotals,
      ...manualFlags,
      averageFeedKgPerHead: v.avgFeed,
      groupData: v.groupData.map((g: any, index: number) => ({
        animalGroupId: g.animalGroupId,
        rationId: g.rationId || null,
        headCount: g.headCount,
        scaricatoKg: g.scaricatoKg,
        avanzoKg: g.avanzoKg,
        avgProductionKg: g.avgProductionKg,
        animalCategoryCode: this.normalizeCategoryCode(g.animalCategoryCode || g.categoryCode),
        displayOrder: index
      })),
    };

    const sub = this.http.post<any>(API_ENDPOINTS.DAY_DATA.SAVE, payload).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.toast.success(res.message ?? this.translate.instant('dailyEntry.messages.saveSuccess'));
          if (this.isValidGuid(res.data?.dayId)) {
            this.dayId = res.data.dayId;
          }
          // ✅ Reload form with saved data from API
          this.loadDependenciesAndBuild(this.dayId);
        } else {
          this.toast.error(res.message);
          this.isSaving = false;
        }
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

  private extractDayDate(day: any): string {
    return this.normalizeDateString(day?.date ?? day?.Date ?? day?.dayDate ?? day?.DayDate ?? day?.dataGiorno ?? '');
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
    // Already ISO yyyy-MM-dd — use directly (no timezone conversion needed)
    if (/^\d{4}-\d{2}-\d{2}/.test(text)) {
      return text.slice(0, 10);
    }

    const parsed = new Date(text);
    if (Number.isNaN(parsed.getTime())) {
      return '';
    }

    // Use LOCAL date components to avoid UTC offset shifting the date
    const y = parsed.getFullYear();
    const m = String(parsed.getMonth() + 1).padStart(2, '0');
    const d = String(parsed.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  private normalizeCategoryCode(value: unknown): string | null {
    const trimmed = String(value ?? '').trim().toUpperCase();
    return trimmed.length ? trimmed : null;
  }


private setupMilkTracking(): void {
  const delivered$ = this.form.get('milkDeliveredKg')!.valueChanges.pipe(
    debounceTime(1000),
    map(() => 'delivered' as const)
  );

  const produced$ = this.form.get('milkProducedKg')!.valueChanges.pipe(
    debounceTime(1000),
    map(() => 'produced' as const)
  );

  const avg$ = this.form.get('avgMilkPerHead')!.valueChanges.pipe(
    debounceTime(1000),
    map(() => 'avg' as const)
  );

  const sub = merge(delivered$, produced$, avg$)
    .subscribe((field: 'delivered' | 'produced' | 'avg') => {
      this.lastEditedMilkField = field;
      this.recalculateDerivedFields();
    });

  this.subs.push(sub);
}

  private setupDerivedFieldCalculations(): void {
    const controls = [
      'gim',
      'totalHeads',
      'totalCapi',
      'firstCalving',
      'pregnantCows',
      'firstCalvingPctManual',
      'pregnantCowsPctManual',
      'crepManual',
      'firstCalvingPct',
      'pregnantCowsPct',
      //'milkDeliveredKg',
      'inLactation',
      'nonMungitura',
    ];

    const streams = controls
      .map((c) => this.form.get(c)?.valueChanges)
      .filter(Boolean) as any[];

    const sub = merge(...streams)
      .pipe(debounceTime(50))
      .subscribe(() => this.recalculateDerivedFields());
    this.subs.push(sub);

    // Initial calculation
    this.recalculateDerivedFields();
  }

 private recalculateDerivedFields(): void {
  if (!this.form) return;

  // ===== EXISTING LOGIC (keep as is) =====
  const total = this.getTotalCowsPresent();
  const firstCalving = this.toNumberOrNull(this.form.get('firstCalving')?.value);
  const pregnantCows = this.toNumberOrNull(this.form.get('pregnantCows')?.value);
  const gim = this.toNumberOrNull(this.form.get('gim')?.value);

  const firstCalvingPctManual = !!this.form.get('firstCalvingPctManual')?.value;
  const pregnantCowsPctManual = !!this.form.get('pregnantCowsPctManual')?.value;
  const crepManual = !!this.form.get('crepManual')?.value;

  const autoFirstCalvingPct =
    total && firstCalving != null ? this.roundTo1((firstCalving / total) * 100) : null;
  if (!firstCalvingPctManual) {
    this.form.get('firstCalvingPct')?.setValue(autoFirstCalvingPct, { emitEvent: false });
  }

  const autoPregnantPct =
    total && pregnantCows != null ? this.roundTo1((pregnantCows / total) * 100) : null;
  if (!pregnantCowsPctManual) {
    this.form.get('pregnantCowsPct')?.setValue(autoPregnantPct, { emitEvent: false });
  }

  const pregnantPctValue = this.toNumberOrNull(this.form.get('pregnantCowsPct')?.value);
  const autoCrep =
    gim != null && pregnantPctValue != null && pregnantPctValue > 0
      ? this.roundTo2(gim / pregnantPctValue)
      : null;
  if (!crepManual) {
    this.form.get('crep')?.setValue(autoCrep, { emitEvent: false });
  }

  // ===== NEW MILK LOGIC =====

  const milkDelivered = this.toNumberOrNull(this.form.get('milkDeliveredKg')?.value);
  const milkProduced = this.toNumberOrNull(this.form.get('milkProducedKg')?.value);
  const avgMilk = this.toNumberOrNull(this.form.get('avgMilkPerHead')?.value);

  const animalsInLactation = this.toNumberOrNull(this.form.get('inLactation')?.value);
  const nonMungitura = this.toNumberOrNull(this.form.get('nonMungitura')?.value) ?? 0;

  const milkingCows = (animalsInLactation ?? 0) - nonMungitura;

  if (milkingCows <= 0 || !animalsInLactation) return;


  if (milkDelivered == null && milkProduced == null && avgMilk == null) {
  this.form.patchValue({
    avgMilkPerHead: null,
    milkProducedKg: null,
    milkDeliveredKg: null
  }, { emitEvent: false });
  return;
}
  switch (this.lastEditedMilkField) {

    case 'delivered':
      if (milkDelivered != null) {
        const avg = milkDelivered / milkingCows;
        const produced = avg * animalsInLactation;

        this.form.patchValue({
          avgMilkPerHead: this.roundTo2(avg),
          milkProducedKg: this.roundTo2(produced)
        }, { emitEvent: false });
      }
      break;

    case 'produced':
      if (milkProduced != null) {
        const avg = milkProduced / animalsInLactation;
        const delivered = avg * milkingCows;

        this.form.patchValue({
          avgMilkPerHead: this.roundTo2(avg),
          milkDeliveredKg: this.roundTo2(delivered)
        }, { emitEvent: false });
      }
      break;

    case 'avg':
      if (avgMilk != null) {
        const delivered = avgMilk * milkingCows;
        const produced = avgMilk * animalsInLactation;

        this.form.patchValue({
          milkDeliveredKg: this.roundTo2(delivered),
          milkProducedKg: this.roundTo2(produced)
        }, { emitEvent: false });
      }
      break;

    default:
  if (milkDelivered != null) {
    const avg = milkDelivered / milkingCows;
    const produced = avg * animalsInLactation;

    this.form.patchValue({
      avgMilkPerHead: this.roundTo2(avg),
      milkProducedKg: this.roundTo2(produced)
    }, { emitEvent: false });

  } else if (milkProduced != null) {
    const avg = milkProduced / animalsInLactation;
    const delivered = avg * milkingCows;

    this.form.patchValue({
      avgMilkPerHead: this.roundTo2(avg),
      milkDeliveredKg: this.roundTo2(delivered)
    }, { emitEvent: false });
  }
  break;
  }
}

  private getTotalCowsPresent(): number | null {
    const totalHeads = this.toNumberOrNull(this.form.get('totalHeads')?.value);
    if (totalHeads != null && totalHeads > 0) {
      return totalHeads;
    }
    const totalCapi = this.toNumberOrNull(this.form.get('totalCapi')?.value);
    if (totalCapi != null && totalCapi > 0) {
      return totalCapi;
    }
    return null;
  }

  private toNumberOrNull(value: unknown): number | null {
    if (value === null || value === undefined || value === '') return null;
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }

  private roundTo1(value: number): number {
    return Math.round(value * 10) / 10;
  }

  private roundTo2(value: number): number {
    return Math.round(value * 100) / 100;
  }

  private initializeRouteSelection(): void {
    this.pendingRouteDayId = this.route.snapshot.queryParamMap.get('dayId')?.trim() ?? '';
    this.pendingRouteDate = this.normalizeDateString(this.route.snapshot.queryParamMap.get('date') ?? '');

    if (this.pendingRouteDate) {
      this.selectedDate = this.pendingRouteDate;
    }
  }

  onSortChange(event: { column: string; direction: 'asc' | 'desc' }): void {
    this.sortColumn    = event.column;
    this.sortDirection = event.direction;
    this.pageIndex     = 0;
    // Save user-entered values, sort the full list client-side, rebuild FormArray
    this.syncGroupCache();
    this.sortAllGroupsClientSide();
    this.buildGroupRows();
    this.computePagedGroups();
  }

  onPageChange(event: PageEvent): void {
    // All groups are already loaded — just slice a different page, no API call
    this.pageIndex = event.pageIndex;
    this.pageSize  = event.pageSize;
    this.computePagedGroups();
  }

  onFilterChange(columnName: string, filterValue: string): void {
    this.columnFilters[columnName] = filterValue.trim();
    this.pageIndex = 0;
    this.computePagedGroups();   // instant client-side filter, no loader
  }

  clearFilters(): void {
    Object.keys(this.columnFilters).forEach(key => { this.columnFilters[key] = ''; });
    this.pageIndex = 0;
    this.computePagedGroups();
  }

  hasActiveFilters(): boolean {
    return Object.values(this.columnFilters).some(val => val !== '');
  }

  getSortIndicator(columnField: string): string {
    if (this.sortColumn !== columnField) return '';
    return this.sortDirection === 'asc' ? ' ↑' : ' ↓';
  }

  isSortable(columnField: string): boolean {
    return this.sortableColumns.includes(columnField);
  }

  private getTodayString(): string {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  }

  get selectedDateLabel(): string {
    if (!this.selectedDate) return '';
    // Parse as local date by adding T00:00:00 to avoid UTC shift
    const d = new Date(`${this.selectedDate}T00:00:00`);
    return d.toLocaleDateString('it-IT', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }
}
