import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { TechnicalReportAddEditComponent } from '../technical-report-add-edit/technical-report-add-edit.component';
import { TechnicalReportService } from '../../../core/services/technical-report/technical-report.service';
import { ReusableTableComponent } from '../../../shared/components/reusable-table/reusable-table.component';
import {
  TechnicalReportDetails,
  Feed,
  FeedTotals
} from '../../../core/models/technical-report-details';
import { SharedModule } from '../../../shared/shared.module';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

interface TechnicalReportRow {
  feedName: string;
  quantityKg: number;
  totalDM: number;
  crudeProtein: number;
  energyMJ: number;
}

@Component({
  selector: 'app-technical-report-list',
  standalone: true,
  imports: [SharedModule, ReactiveFormsModule, FormsModule,ReusableTableComponent],
  templateUrl: './technical-report-list.component.html',
  styleUrls: ['./technical-report-list.component.css']
})
export class TechnicalReportListComponent implements OnInit {

  ration!: TechnicalReportDetails;

  

  feeds: Feed[] = [];
  filteredFeeds: Feed[] = [];

  search = '';
  filter: 'ALL' | 'HIGH_ENERGY' | 'HIGH_PROTEIN' = 'ALL';

  // KPI totals
  totalDM = 0;
  totalProtein = 0;
  totalEnergy = 0;
  totalADF = 0;
  totalFat = 0;
  totalCalcium = 0;
  totalPhosphorus = 0;
  totalStarch = 0;
  tableTotals: Record<string, number> = {};
showFooter = true;


  expandedFeeds = new Set<string>();

  constructor(private service: TechnicalReportService) { 
    this.setColumns();
  }

  ngOnInit(): void {
    this.loadReport();
  }

  private loadReport(): void {
    this.service.getTechnicalReport().subscribe(res => {
      if (!res?.data?.length) return;

      this.ration = res.data[0];
      this.feeds = [...this.ration.feeds];
      this.filteredFeeds = [...this.feeds];

      this.calculateTableTotals();
    });
  }

  columns: string[] = [];
columnFields: string[] = [];

private setColumns(): void {
 this.columns = [
    'Feed',
    'Quantity (kg)',
    'Dry Matter (%)',
    'Protein (%)',
    'Energy',
    'ADF (%)',
    'Fat Content (%)',
    'Calcium (%)',
    'Phosphorus (%)',
    'Starch (%)',
    'Quantity (kg)'
  ];

  this.columnFields = [
    'feedName',
    'quantityPerKg',
    'dryMatter',
    'protein',
    'energy',
    'adf',
    'fatContent',
    'calcium',
    'phosphorus',
    'starch',
    'quantityPerKg',

  ];
}


  // ---------------- Filters ----------------

  applyFilter(): void {
    this.filteredFeeds = this.feeds.filter(feed => {

      if (this.filter === 'HIGH_ENERGY' && feed.energy < 1000) return false;
      if (this.filter === 'HIGH_PROTEIN' && feed.protein < 15) return false;

      return feed.feedName
        .toLowerCase()
        .includes(this.search.toLowerCase());
    });
  }

  toggleExpand(feedId: string): void {
    this.expandedFeeds.has(feedId)
      ? this.expandedFeeds.delete(feedId)
      : this.expandedFeeds.add(feedId);
  }

  // ---------------- Calculations ----------------

calculateTableTotals(): void {
  const totals: Record<string, number> = {};

  const fields = [
    'quantityPerKg',
    'dryMatter',
    'protein',
    'energy',
    'adf',
    'fatContent',
    'calcium',
    'phosphorus',
    'starch'
  ];

  fields.forEach(f => totals[f] = 0);

  this.feeds.forEach(feed => {
    fields.forEach(field => {
      totals[field] += Number(feed[field as keyof Feed] ?? 0);
    });
  });

  this.tableTotals = totals;
}





  calcDM(feed: Feed): number {
    return (feed.quantityPerKg || 0) * feed.dryMatter / 100;
  }

  calcProtein(feed: Feed): number {
    return (feed.quantityPerKg || 0) * feed.protein / 100;
  }

  calcEnergy(feed: Feed): number {
    return (feed.quantityPerKg || 0) * feed.energy;
  }

  getEnergyContribution(feed: Feed): number {
    if (!this.totalEnergy) return 0;
    return +((this.calcEnergy(feed) / this.totalEnergy) * 100).toFixed(1);
  }
}
