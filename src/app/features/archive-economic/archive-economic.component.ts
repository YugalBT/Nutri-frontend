import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { PERMISSIONS } from '../../core/constants/permissions.constants';
import { Constants } from '../../shared/utils/constants/constants';
import { CommonService } from '../../shared/services/common.service';
import { TranslatePipe } from '../../i18n/translate.pipe';
import {
  EcoArchiveService,
  EcoArchiveRecord,
} from '../../core/services/archive/eco-archive.service';

interface SummaryCard {
  labelKey: string;
  value: string;
  tone: string;
}

@Component({
  selector: 'app-archive-economic',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslatePipe],
  templateUrl: './archive-economic.component.html',
  styleUrl: './archive-economic.component.css',
})
export class ArchiveEconomicComponent implements OnInit, OnDestroy {
  records: EcoArchiveRecord[] = [];
  totalRecords = 0;
  isLoading = false;
  isSuperAdmin = false;
  companies: { id: string; name: string }[] = [];
  selectedCompanyId = '';

  fromDate: string = this.getMonthStart();
  toDate: string = this.getToday();
  pageNo = 1;
  pageSize = 30;

  private subs: Subscription[] = [];

  constructor(
    private router: Router,
    private ecoArchiveService: EcoArchiveService,
    private common: CommonService,
  ) {}

  ngOnInit(): void {
    this.isSuperAdmin = localStorage.getItem(Constants.IsSuperAdmin) === 'true';

    if (!this.common.checkPermission(PERMISSIONS.ArchiveView, false)) {
      return;
    }

    if (this.isSuperAdmin) {
      const sub = this.common.getCompanyDropdown().subscribe({
        next: (res) => {
          this.companies = res?.data ?? [];
          this.loadArchive();
        },
        error: () => this.loadArchive(),
      });
      this.subs.push(sub);
      return;
    }

    this.loadArchive();
  }

  loadArchive(): void {
    this.isLoading = true;

    const sub = this.ecoArchiveService
      .getEcoArchive({
        fromDate: this.fromDate,
        toDate: this.toDate,
        pageNo: this.pageNo,
        pageSize: this.pageSize,
        companyId: this.isSuperAdmin && this.selectedCompanyId ? this.selectedCompanyId : undefined,
      })
      .subscribe({
        next: (res) => {
          this.records = res?.data ?? [];
          this.totalRecords = res?.totalRecords ?? 0;
          this.isLoading = false;
        },
        error: () => {
          this.records = [];
          this.totalRecords = 0;
          this.isLoading = false;
        },
      });

    this.subs.push(sub);
  }

  get summaryCards(): SummaryCard[] {
    return [
      {
        labelKey: 'archiveEco.summary.milkRevenue',
        value: this.formatMoney(this.sumBy((r) => this.getMilkRevenue(r))),
        tone: 'tone-green',
      },
      {
        labelKey: 'archiveEco.summary.feedCost',
        value: this.formatMoney(this.sumBy((r) => this.getFeedCost(r))),
        tone: 'tone-orange',
      },
      {
        labelKey: 'archiveEco.summary.avgIofc',
        value: this.formatMoney(this.avgBy((r) => this.getIofc(r))),
        tone: 'tone-blue',
      },
      {
        labelKey: 'archiveEco.summary.costPerLiter',
        value: this.formatMoney(this.avgBy((r) => this.getCostPerLiter(r))),
        tone: 'tone-purple',
      },
      {
        labelKey: 'archiveEco.summary.avgMilkPrice',
        value: this.formatMoney(this.avgBy((r) => r.milkPriceEurLitre ?? null)),
        tone: 'tone-teal',
      },
      {
        labelKey: 'archiveEco.summary.avgDryMatter',
        value: this.formatNumber(this.avgBy((r) => r.kgTq ?? null), 2),
        tone: 'tone-slate',
      },
    ];
  }

  onCompanyChange(): void {
    this.pageNo = 1;
    this.loadArchive();
  }

  onDateChange(): void {
    this.pageNo = 1;
    this.loadArchive();
  }

  onPageChange(page: number): void {
    this.pageNo = page;
    this.loadArchive();
  }

  loadRecord(record: EcoArchiveRecord): void {
    this.router.navigate(['/daily-entry'], {
      queryParams: {
        dayId: record.dayId,
        date: record.date ?? '',
      },
    });
  }

  getDisplayDate(record: EcoArchiveRecord): string {
    return record.date ?? '-';
  }

  getGroupLabel(record: EcoArchiveRecord): string {
    return record.rationName || record.animalGroupName || record.categoryCode || '-';
  }

  getPriceTypeLabel(record: EcoArchiveRecord): string {
    if (record.priceType == null) return '-';
    return record.priceType === 0 ? 'Aziendali' : 'Mercato';
  }

  getMilkRevenue(record: EcoArchiveRecord): number | null {
    if (record.milkRevenueEur != null) return record.milkRevenueEur;
    const milk = record.milkDeliveredKg ?? record.milkProducedKg ?? null;
    const price = record.milkPriceEurLitre ?? null;
    return milk != null && price != null ? milk * price : null;
  }

  getFeedCost(record: EcoArchiveRecord): number | null {
    return record.totalFeedCostEur ?? record.rationCostEur ?? null;
  }

  getIofc(record: EcoArchiveRecord): number | null {
    if (record.iofcPerCow != null) return record.iofcPerCow;
    const revenue = this.getMilkRevenue(record);
    const cost = this.getFeedCost(record);
    const cows = record.totalHeads ?? null;
    return revenue != null && cost != null && cows != null && cows > 0
      ? (revenue - cost) / cows
      : null;
  }

  getCostPerLiter(record: EcoArchiveRecord): number | null {
    if (record.costPerLiterMilk != null) return record.costPerLiterMilk;
    const cost = this.getFeedCost(record);
    const milk = record.milkDeliveredKg ?? record.milkProducedKg ?? null;
    return cost != null && milk != null && milk > 0 ? cost / milk : null;
  }

  getFeedEfficiency(record: EcoArchiveRecord): number | null {
    if (record.feedEfficiency != null) return record.feedEfficiency;
    const milk = record.milkProducedKg ?? record.milkDeliveredKg ?? null;
    const dm = record.kgTq ?? null;
    return milk != null && dm != null && dm > 0 ? milk / dm : null;
  }

  fmt(value: number | null | undefined, digits = 2): string {
    return this.formatNumber(value ?? null, digits);
  }

  fmtMoney(value: number | null | undefined, digits = 2): string {
    return this.formatMoney(value ?? null, digits);
  }

  fmtPct(value: number | null | undefined, digits = 1): string {
    return value == null ? '-' : `${this.formatNumber(value, digits)}%`;
  }

  private sumBy(fn: (r: EcoArchiveRecord) => number | null): number | null {
    const values = this.records
      .map(fn)
      .filter((v): v is number => v != null && Number.isFinite(v));
    return values.length ? values.reduce((a, b) => a + b, 0) : null;
  }

  private avgBy(fn: (r: EcoArchiveRecord) => number | null): number | null {
    const values = this.records
      .map(fn)
      .filter((v): v is number => v != null && Number.isFinite(v));
    return values.length ? values.reduce((a, b) => a + b, 0) / values.length : null;
  }

  private formatMoney(value: number | null, digits = 2): string {
    return value == null ? '-' : `${this.formatNumber(value, digits)} EUR`;
  }

  private formatNumber(value: number | null, digits = 2): string {
    if (value == null || !Number.isFinite(value)) return '-';
    return value.toLocaleString('it-IT', {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    });
  }

  private getMonthStart(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
  }

  private getToday(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }
}
