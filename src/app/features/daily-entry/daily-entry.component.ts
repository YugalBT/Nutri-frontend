import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription, forkJoin, Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
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
  imports: [CommonModule, ReactiveFormsModule, FormsModule, TranslatePipe, MatPaginatorModule,DragDropModule],
  templateUrl: './daily-entry.component.html',
  styleUrl: './daily-entry.component.css',
})
export class DailyEntryComponent implements OnInit, OnDestroy {
  form!: FormGroup;

  dayId = '';
  farmId = '';
  days: any[] = [];
  selectedDate = '';

  animalGroups: any[] = [];
  rations: any[] = [];
  totalAnimalGroupRecords = 0;

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
  { id: 'herdComposition' },
  { id: 'milk' },
  { id: 'robot' },
  { id: 'health' },
  { id: 'herd' },
  { id: 'calves' }
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
  
  // Debounce filter subject
  private filterSubject = new Subject<{ column: string; value: string }>();

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
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.isSuperAdmin = localStorage.getItem(Constants.IsSuperAdmin) === 'true';
    this.canSave = this.common.hasAnyPermission(
      [PERMISSIONS.DailyEntryAdd, PERMISSIONS.DailyEntryEdit],
      false
    );
    if (!this.common.checkPermission(PERMISSIONS.DailyEntryView, false)) {
      this.isInitializing = false;
      return;
    }
    
    // Setup filter debouncing
    const filterSub = this.filterSubject
      .pipe(debounceTime(500))
      .subscribe((filterEvent) => {
        this.columnFilters[filterEvent.column] = filterEvent.value.trim();
        this.pageIndex = 0;
        this.loadDependenciesAndBuild(this.dayId || null);
      });
    this.subs.push(filterSub);
    
    this.selectedDate = this.getTodayString();
    this.initializeRouteSelection();
    if (this.isSuperAdmin) {
      this.loadCompanies();
    } else {
      this.loadDaysAndResolve();
    }

     this.loadLayout();
  }
 

  drop(event: CdkDragDrop<any[]>) {
    moveItemInArray(this.sections, event.previousIndex, event.currentIndex);
    this.saveLayout();
  }

 saveLayout() {
  const layout = this.sections.map(s => s.id);

  this.common.saveUserLayout({
    pageName: 'DailyEntry',
    layoutJson: JSON.stringify(layout)
  }).subscribe();
}

loadLayout() {
  this.common.getUserLayout('DailyEntry')
    .subscribe((res: any) => {

      if (res?.data) {
        const saved = JSON.parse(res.data);

        this.sections.sort((a, b) => {
          const indexA = saved.indexOf(a.id);
          const indexB = saved.indexOf(b.id);

          return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
        });
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
    this.isLoading = true;
    const cid = this.isSuperAdmin && this.selectedCompanyId ? this.selectedCompanyId : undefined;

    // Build column filters array
    const columnFiltersArray = Object.entries(this.columnFilters)
      .filter(([_, value]) => value !== '')
      .map(([field, value]) => ({ field, value }));

    const requests: any = {
      groups: this.common.getAnimalGroupsList(cid, {
        pageNo: this.pageIndex + 1,
        recordPerPage: this.pageSize,
        sortColumn: this.sortColumn,
        sortDirection: this.sortDirection,
        columnFilters: columnFiltersArray,
      }),
      rations: this.common.getGetAllRationList(cid),
    };

    if (dayId) {
      requests.existing = this.http.get<any>(`${API_ENDPOINTS.DAY_DATA.GET_BY_DAY_ID}/${dayId}`);
    }

    const sub = forkJoin(requests).subscribe({
      next: (res: any) => {
        this.animalGroups = res.groups?.data ?? [];
        this.totalAnimalGroupRecords = res.groups?.totalRecords ?? 0;
        this.rations = res.rations?.data ?? [];
        this.filteredRations = [...this.rations];
        this.rationFilter = '';
        this.buildGroupRows();
        if (res.existing?.data) {
          this.farmId = this.farmId || this.extractFarmId(res.existing.data);
          const existingDate = this.extractDayDate(res.existing.data);
          if (existingDate) {
            this.selectedDate = existingDate;
          }
          this.patchForm(res.existing.data);
        }
        this.isLoading = false;
        this.isSaving = false;
      },
      error: () => {
        this.isLoading = false;
        this.isSaving = false;
        this.buildGroupRows();
      },
    });

    this.subs.push(sub);
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
    if (!rationId) {
      return 'Select Ration';
    }
    const selected = this.rations.find(r => r.rationId === rationId);
    return selected ? selected.rationName : 'Select Ration';
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
      milkProducedKg: [null],
      milkDeliveredKg: [null],
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
    });
  }

  private buildGroupRows(): void {
    const fa = this.groupData;
    while (fa.length) fa.removeAt(0);

    this.animalGroups.forEach((g) => {
      fa.push(this.fb.group({
        animalGroupId: [g.animalGroupId],
        animalGroupName: [g.animalGroupNameEn],
        animalCategoryCode: [g.animalCategoryCode],
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
      categoryCode: data.categoryCode,
      gim: data.gim,
      nonMungitura: data.nonMungitura,
      totalCapi: data.totalCapi,
      animalsInLactation: data.animalsInLactation,
      dryAnimals: data.dryAnimals,
      firstCalving: data.firstCalving,
      secondCalving: data.secondCalving,
      multiparous: data.multiparous,
      milkProducedKg: data.milkProducedKg,
      milkDeliveredKg: data.milkDeliveredKg,
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
            animalCategoryCode: match.categoryCode || ctrl.value.animalCategoryCode,
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
    const payload: any = {
      dayId,
      farmId: this.farmId || '00000000-0000-0000-0000-000000000000',
      date: this.selectedDate,
      ...(this.isSuperAdmin && this.selectedCompanyId ? { tenantId: this.selectedCompanyId } : {}),
      ...v,
      averageFeedKgPerHead: v.avgFeed,
      groupData: v.groupData.map((g: any,index: number) => ({
        animalGroupId: g.animalGroupId,
        rationId: g.rationId || null,
        headCount: g.headCount,
        scaricatoKg: g.scaricatoKg,
        avanzoKg: g.avanzoKg,
        avgProductionKg: g.avgProductionKg,
        animalCategoryCode: g.animalCategoryCode || g.categoryCode, 
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

  private initializeRouteSelection(): void {
    this.pendingRouteDayId = this.route.snapshot.queryParamMap.get('dayId')?.trim() ?? '';
    this.pendingRouteDate = this.normalizeDateString(this.route.snapshot.queryParamMap.get('date') ?? '');

    if (this.pendingRouteDate) {
      this.selectedDate = this.pendingRouteDate;
    }
  }

  onSortChange(event: { column: string; direction: 'asc' | 'desc' }): void {
    this.sortColumn = event.column;
    this.sortDirection = event.direction;
    this.pageIndex = 0;
    this.loadDependenciesAndBuild(this.dayId || null);
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadDependenciesAndBuild(this.dayId || null);
  }

  onFilterChange(columnName: string, filterValue: string): void {
    this.filterSubject.next({ column: columnName, value: filterValue });
  }

  clearFilters(): void {
    Object.keys(this.columnFilters).forEach(key => {
      this.columnFilters[key] = '';
    });
    this.pageIndex = 0;
    this.loadDependenciesAndBuild(this.dayId || null);
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
