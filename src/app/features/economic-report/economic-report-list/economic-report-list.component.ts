import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { NgxEchartsModule } from 'ngx-echarts';
import type { EChartsOption } from 'echarts';

import { SharedModule } from '../../../shared/shared.module';
import { User } from '../../../state/auth/auth.models';
import { selectAuthUser } from '../../../state/auth/auth.selectors';
import { CommonService } from '../../../shared/services/common.service';
import { TechnicalReportService } from '../../../core/services/technical-report/technical-report.service';
import { AggregatedReportItem } from '../../../core/models/dashboarddata';

@Component({
  selector: 'app-economic-report-list',
  standalone: true,
  imports: [CommonModule, FormsModule, SharedModule, DecimalPipe, NgxEchartsModule],
  templateUrl: './economic-report-list.component.html',
  styleUrl: './economic-report-list.component.css',
})
export class EconomicReportListComponent implements OnInit {
  user: User | null = null;
  isLoading = false;

  selectedYear = new Date().getFullYear();
  selectedPeriod: 'Monthly' | 'Quarterly' | 'Annual' = 'Monthly';
  yearOptions = Array.from({ length: 7 }, (_, i) => new Date().getFullYear() - i);

  costPerAnimal = 0;
  incomePerAnimal = 0;
  marginPerAnimal = 0;

  feedEfficiency = 0;
  marginPercentage = 0;
  costPerLiter = 0;

  costIncomeChart: EChartsOption = {};
  marginTrendChart: EChartsOption = {};

  constructor(
    private store: Store,
    private commonService: CommonService,
    private technicalReportService: TechnicalReportService,
  ) {}

  ngOnInit(): void {
    this.store.select(selectAuthUser).subscribe((u) => {
      this.user = u;
      this.loadEconomicData();
    });
  }

  get isAdmin(): boolean {
    return (this.user?.roleType || '').toUpperCase() === 'ADMIN';
  }

  onFiltersChange(): void {
    this.loadEconomicData();
  }

  private loadEconomicData(): void {
    if (!this.user) {
      return;
    }

    this.isLoading = true;
    if (this.isAdmin) {
      this.commonService
        .getAggregatedReport({
          year: this.selectedYear,
          period: this.selectedPeriod,
          companyId: null,
        })
        .subscribe({
          next: (res) => {
            const rows = res?.isSuccess && Array.isArray(res.data) ? res.data : [];
            this.applyFromAggregated(rows);
            this.isLoading = false;
          },
          error: () => {
            this.isLoading = false;
          },
        });
      return;
    }

    this.technicalReportService.getTechnicalReport().subscribe({
      next: (res) => {
        const rows = res?.isSuccess && Array.isArray(res.data) ? res.data : [];
        const mockAggregated: AggregatedReportItem[] = rows.map((x: any, idx: number) => {
          const iofc = (x.global || []).find((g: any) => (g.name || '').toUpperCase().includes('IOFC'))?.value || 0;
          const cost = (x.global || []).find((g: any) => (g.name || '').toUpperCase().includes('COST'))?.value || 0;
          const dea = (x.global || []).find((g: any) => (g.name || '').toUpperCase().includes('DEA'))?.value || 0;
          return {
            periodLabel: `R${idx + 1}`,
            reports: 1,
            animalCount: x.animalGroup?.numberOfAnimals || 0,
            avgMilkPerDay: x.animalGroup?.avgMilkPerDay || 0,
            iofc,
            deaMilk: dea,
            cost,
          };
        });
        this.applyFromAggregated(mockAggregated);
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  private applyFromAggregated(rows: AggregatedReportItem[]): void {
    const totalAnimals = rows.reduce((sum, r) => sum + (r.animalCount || 0), 0);
    const totalCost = rows.reduce((sum, r) => sum + (r.cost || 0), 0);
    const totalIncome = rows.reduce((sum, r) => sum + ((r.deaMilk || 0) + (r.iofc || 0)), 0);
    const totalMilk = rows.reduce((sum, r) => sum + (r.avgMilkPerDay || 0), 0);

    this.costPerAnimal = totalAnimals > 0 ? totalCost / totalAnimals : 0;
    this.incomePerAnimal = totalAnimals > 0 ? totalIncome / totalAnimals : 0;
    this.marginPerAnimal = this.incomePerAnimal - this.costPerAnimal;

    this.feedEfficiency = totalCost > 0 ? (totalIncome / totalCost) * 100 : 0;
    this.marginPercentage = totalIncome > 0 ? (this.marginPerAnimal / this.incomePerAnimal) * 100 : 0;
    this.costPerLiter = totalMilk > 0 ? totalCost / totalMilk : 0;

    this.costIncomeChart = {
      tooltip: { trigger: 'axis' },
      legend: { data: ['Cost', 'Income'] },
      xAxis: {
        type: 'category',
        data: rows.map((r) => r.periodLabel),
      },
      yAxis: {
        type: 'value',
      },
      series: [
        {
          name: 'Cost',
          type: 'bar',
          data: rows.map((r) => r.cost),
          itemStyle: { color: '#f46a4e' },
        },
        {
          name: 'Income',
          type: 'bar',
          data: rows.map((r) => r.iofc + r.deaMilk),
          itemStyle: { color: '#34c38f' },
        },
      ],
    };

    this.marginTrendChart = {
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: rows.map((r) => r.periodLabel),
      },
      yAxis: {
        type: 'value',
      },
      series: [
        {
          name: 'Margin',
          type: 'line',
          smooth: true,
          data: rows.map((r) => r.iofc + r.deaMilk - r.cost),
          itemStyle: { color: '#556ee6' },
        },
      ],
    };
  }
}
