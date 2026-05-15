import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Subscription, debounceTime } from 'rxjs';
import { HttpService } from '../../shared/services/http.service';
import { ToastService } from '../../shared/services/toast.service';
import { CommonService } from '../../shared/services/common.service';
import { TranslatePipe } from '../../i18n/translate.pipe';
import { TranslateService } from '../../i18n/translate.service';
import { Constants } from '../../shared/utils/constants/constants';
import { API_ENDPOINTS } from '../../core/constants/api-endpoints';
import { PERMISSIONS } from '../../core/constants/permissions.constants';

@Component({
  selector: 'app-calves-entry',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, TranslatePipe],
  templateUrl: './calves-entry.component.html',
  styleUrls: ['./calves-entry.component.css'],
})
export class CalvesEntryComponent implements OnInit, OnDestroy {

  form!: FormGroup;

  isLoading = false;
  isSaving = false;
  isSuperAdmin = false;
  canSave = false;

  selectedDate: string = this.getToday();
  selectedCompanyId = '';
  companies: { id: string; name: string }[] = [];

  dayId = '';
  farmId = '';

  private subs: Subscription[] = [];

  // ── Price state ────────────────────────────────────────────────
  /** Full list of feeds for the dropdown */
  feeds: { feedId: string; feedName: string; pricePerKg: number }[] = [];
  /** Currently selected feed ID */
  selectedFeedId = '';
  /** Feed price derived from the selected feed */
  feedPrice = 0;
  /** Milk price — pre-filled from history, editable by the user */
  milkPrice = 0;

  // ── Calculated outputs ─────────────────────────────────────────
  indCostPerHead = 0;
  grpCostPerHead = 0;
  indTotal = 0;
  grpTotal = 0;
  totalCost = 0;

  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    private toast: ToastService,
    private common: CommonService,
    private translate: TranslateService,
  ) { }

  ngOnInit(): void {
    this.isSuperAdmin = localStorage.getItem(Constants.IsSuperAdmin) === 'true';

    this.canSave =
      this.common.checkPermission(PERMISSIONS.DailyEntryAdd, false) ||
      this.common.checkPermission(PERMISSIONS.DailyEntryEdit, false);

    this.initForm();

    this.form.valueChanges
      .pipe(debounceTime(200))
      .subscribe(() => this.calculate());

    this.loadPrices();

    if (this.isSuperAdmin) {
      const sub = this.common.getCompanyDropdown().subscribe({
        next: (res) => {
          this.companies = res?.data ?? [];
          if (this.companies.length > 0) {
            this.selectedCompanyId = this.companies[0].id;
          }
          this.loadDay();
        },
      });
      this.subs.push(sub);
    } else {
      this.loadDay();
    }
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }

  private getToday(): string {
    return new Date().toISOString().split('T')[0];
  }

  private initForm(): void {
    this.form = this.fb.group({
      indAnimals: [null],
      indAvgMilk: [null],
      indPowder: [null],
      indAvgFeed: [null],

      grpAnimals: [null],
      grpAvgMilk: [null],
      grpPowder: [null],
      grpAvgFeed: [null],
    });
  }

  // =============================
  // 🔹 PRICE LOADING
  // =============================
  private loadPrices(): void {
    // Milk price — latest PriceAziendali from history (user can override)
    const milkSub = this.http
      .get<any>(API_ENDPOINTS.MILK_PRICE_HISTORY.GET_BY_FARM)
      .subscribe({
        next: (res) => {
          const list: any[] = Array.isArray(res?.data) ? res.data : [];
          if (list.length > 0) {
            this.milkPrice = +(list[0].priceAziendali ?? list[0].PriceAziendali ?? 0);
          }
          this.calculate();
        },
        error: () => {},
      });
    this.subs.push(milkSub);

    // Feed list — populate dropdown; default to first feed
    const feedSub = this.http
      .get<any>(API_ENDPOINTS.COMMON_API.GET_ALL_FEED)
      .subscribe({
        next: (res) => {
          const raw: any[] = Array.isArray(res?.data) ? res.data : [];
          this.feeds = raw.map(f => ({
            feedId:    f.feedId    ?? f.FeedId    ?? '',
            feedName:  f.feedName  ?? f.FeedName  ?? '',
            pricePerKg: +(f.pricePerKg ?? f.PricePerKg ?? 0),
          }));

          if (this.feeds.length > 0 && !this.selectedFeedId) {
            this.selectedFeedId = this.feeds[0].feedId;
            this.feedPrice      = this.feeds[0].pricePerKg;
          }
          this.calculate();
        },
        error: () => {},
      });
    this.subs.push(feedSub);
  }

  // =============================
  // 🔹 PRICE CHANGE HANDLERS
  // =============================

  /** Called when the user picks a different feed from the dropdown. */
  onFeedChange(): void {
    const feed = this.feeds.find(f => f.feedId === this.selectedFeedId);
    this.feedPrice = feed?.pricePerKg ?? 0;
    this.calculate();
  }

  /** Called when the user edits the milk price input directly. */
  onMilkPriceChange(): void {
    this.calculate();
  }

  // =============================
  // 🔹 CALCULATION LOGIC
  // =============================
  calculate(): void {
    const v = this.form.value;

    this.indCostPerHead = this.getCost(v.indAvgMilk ?? 0, v.indPowder ?? 0, v.indAvgFeed ?? 0);
    this.indTotal       = (v.indAnimals || 0) * this.indCostPerHead;

    this.grpCostPerHead = this.getCost(v.grpAvgMilk ?? 0, v.grpPowder ?? 0, v.grpAvgFeed ?? 0);
    this.grpTotal       = (v.grpAnimals || 0) * this.grpCostPerHead;

    this.totalCost = this.indTotal + this.grpTotal;
  }

  getCost(milk: number, powder: number, feed: number): number {
    const milkCost = (!powder || powder === 0)
      ? (milk || 0) * this.milkPrice
      : (milk || 0) * (powder / 100) * this.milkPrice;

    const feedCost = (feed || 0) * this.feedPrice;
    return +(milkCost + feedCost).toFixed(2);
  }

  // =============================
  // 🔹 DATA LOADING
  // =============================
  onDateChange(): void {
    this.loadDay();
  }

  onCompanyChange(): void {
    this.loadDay();
  }

  private loadDay(): void {
    this.isLoading = true;
    this.dayId = '';
    this.farmId = '';
    this.form.reset({
      indAnimals: 0, indAvgMilk: 0, indPowder: 0, indAvgFeed: 0,
      grpAnimals: 0, grpAvgMilk: 0, grpPowder: 0, grpAvgFeed: 0,
    });

    const cid = this.isSuperAdmin && this.selectedCompanyId ? this.selectedCompanyId : undefined;

    const sub = this.common.getDayList(cid).subscribe({
      next: (res: any) => {
        const days: any[] = Array.isArray(res?.data) ? res.data : [];
        const match = days.find((d: any) => (d.date ?? '').split('T')[0] === this.selectedDate);

        if (match) {
          this.dayId  = match.dayId  ?? match.DayId  ?? '';
          this.farmId = match.farmId ?? match.FarmId ?? '';
          this.loadCalvesData();
        } else {
          this.isLoading = false;
        }
      },
      error: () => { this.isLoading = false; },
    });

    this.subs.push(sub);
  }

  private loadCalvesData(): void {
    if (!this.dayId) { this.isLoading = false; return; }

    const sub = this.http
      .get<any>(`${API_ENDPOINTS.DAY_DATA.GET_BY_DAY_ID}/${this.dayId}`)
      .subscribe({
        next: (res) => {
          const d = res?.data;
          if (d) {
            this.form.patchValue({
              indAnimals: d.indAnimals,
              indAvgMilk: d.indAvgMilk,
              indPowder:  d.indPowder,
              indAvgFeed: d.indAvgFeed,
              grpAnimals: d.grpAnimals,
              grpAvgMilk: d.grpAvgMilk,
              grpPowder:  d.grpPowder,
              grpAvgFeed: d.grpAvgFeed,
            });

            // Restore saved feed selection
            const savedFeedId = d.calfFeedId ?? d.CalfFeedId ?? '';
            if (savedFeedId && this.feeds.some(f => f.feedId === savedFeedId)) {
              this.selectedFeedId = savedFeedId;
              this.onFeedChange();
            }

            // Restore saved milk price (may have been manually overridden)
            const savedMilkPrice = +(d.calfMilkPrice ?? d.CalfMilkPrice ?? 0);
            if (savedMilkPrice > 0) {
              this.milkPrice = savedMilkPrice;
            }

            this.calculate();
          }
          this.isLoading = false;
        },
        error: () => { this.isLoading = false; },
      });

    this.subs.push(sub);
  }

  // =============================
  // 🔹 SAVE LOGIC
  // =============================
  save(): void {
    if (!this.canSave || this.isSaving) return;

    if (this.dayId) {
      this.persistCalvesData(this.dayId);
    } else {
      this.createDayAndSave();
    }
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

        const cid = this.isSuperAdmin && this.selectedCompanyId ? this.selectedCompanyId : undefined;
        const sub2 = this.common.getDayList(cid).subscribe({
          next: (res: any) => {
            const days: any[] = Array.isArray(res?.data) ? res.data : [];
            const match = days.find((d: any) => (d.date ?? '').split('T')[0] === this.selectedDate);

            if (match) {
              this.dayId  = match.dayId  ?? match.DayId  ?? '';
              this.farmId = match.farmId ?? match.FarmId ?? '';
              this.persistCalvesData(this.dayId);
            } else {
              this.toast.error(this.translate.instant('dailyEntry.messages.saveError'));
              this.isSaving = false;
            }
          },
          error: () => { this.isSaving = false; },
        });
        this.subs.push(sub2);
      },
      error: () => {
        this.toast.error(this.translate.instant('dailyEntry.messages.saveError'));
        this.isSaving = false;
      },
    });

    this.subs.push(sub);
  }

  private persistCalvesData(dayId: string): void {
    this.isSaving = true;

    const v = this.form.value;
    if ((v.indPowder ?? 0) < 0 || (v.grpPowder ?? 0) < 0) {
      this.toast.warning('Powder % cannot be negative');
      this.isSaving = false;
      return;
    }
    if ((v.indPowder ?? 0) > 100 || (v.grpPowder ?? 0) > 100) {
      this.toast.warning('Powder % cannot be more than 100');
      this.isSaving = false;
      return;
    }

    const payload: any = {
      dayId,
      farmId: this.farmId || '00000000-0000-0000-0000-000000000000',
      date: this.selectedDate,

      ...(this.isSuperAdmin && this.selectedCompanyId ? { tenantId: this.selectedCompanyId } : {}),

      indAnimals: v.indAnimals,
      indAvgMilk: v.indAvgMilk,
      indPowder:  v.indPowder,
      indAvgFeed: v.indAvgFeed,

      grpAnimals: v.grpAnimals,
      grpAvgMilk: v.grpAvgMilk,
      grpPowder:  v.grpPowder,
      grpAvgFeed: v.grpAvgFeed,

      indCostPerHead: this.indCostPerHead,
      indTotal:       this.indTotal,
      grpCostPerHead: this.grpCostPerHead,
      grpTotal:       this.grpTotal,
      totalCost:      this.totalCost,

      // New: user-selected feed and (possibly overridden) milk price
      feedId:    this.selectedFeedId || null,
      milkPrice: this.milkPrice,
    };

    const sub = this.http.post<any>(API_ENDPOINTS.DAY_DATA.SAVE_CALVES, payload).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.toast.success(res.message ?? this.translate.instant('dailyEntry.messages.saveSuccess'));
          this.loadDay();
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
}