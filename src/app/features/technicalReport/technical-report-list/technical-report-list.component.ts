import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../../shared/shared.module';
import { ReusableTableComponent } from '../../../shared/components/reusable-table/reusable-table.component';
import {
  TechnicalReportDetails,
  Feed,
  Global
} from '../../../core/models/technical-report-details';
import { TechnicalReportService } from '../../../core/services/technical-report/technical-report.service';
import { TechnicalReportAddEditComponent } from '../technical-report-add-edit/technical-report-add-edit.component';

interface FeedTableRow {
  feedId: string;
  feedName: string;
  quantity_kg: number;
  totalPerFeed: number;
  [key: string]: string | number;
}

@Component({
  selector: 'app-technical-report-list',
  standalone: true,
  imports: [
    SharedModule,
    ReactiveFormsModule,
    FormsModule,
    ReusableTableComponent,
    TechnicalReportAddEditComponent],
  templateUrl: './technical-report-list.component.html',
  styleUrls: ['./technical-report-list.component.css']
})
export class TechnicalReportListComponent implements OnInit {

  ration?: TechnicalReportDetails;


  // dynamic table
  columns: string[] = [];
  columnFields: string[] = [];
  feeds: FeedTableRow[] = [];

  // global cards
  globalCards: Global[] = [];

  // footer totals
  tableTotals: Record<string, number> = {};
  showFooter = true;

  constructor(private service: TechnicalReportService) { }

  ngOnInit(): void {
    this.loadReport();
  }

  private loadReport(): void {
    this.service.getTechnicalReport().subscribe(res => {
      if (!res?.data?.length) return;

      this.ration = res.data[0];

      this.buildTable(this.ration.feeds);
      this.buildGlobalCards(this.ration.global);
    });
  }

  // ------------------ BUILD TABLE ------------------

  private buildTable(feeds: Feed[]): void {
    const kpiNames = new Set<string>();

    feeds.forEach(feed =>
      feed.kpIs.forEach(kpi => kpiNames.add(kpi.kpiName))
    );

    // Static columns
    this.columns = ['Feed', 'Quantity (kg)'];
    this.columnFields = ['feedName', 'quantity_kg'];

    // Dynamic KPI columns
    kpiNames.forEach(kpi => {
      this.columns.push(kpi);
      this.columnFields.push(kpi);
    });

    // Map rows
    this.feeds = feeds.map(feed => {
      const row: FeedTableRow = {
        feedId: feed.feedId,
        feedName: feed.feedName,
        quantity_kg: feed.quantity_kg,
        totalPerFeed: feed.totalPerFeed
      };

      feed.kpIs.forEach(kpi => {
        row[kpi.kpiName] = kpi.value;
      });

      return row;
    });

    this.calculateTableTotals();
  }

  // ------------------ GLOBAL KPIs ------------------

  private buildGlobalCards(globals: Global[]): void {
    this.globalCards = globals;
  }

  // ------------------ FOOTER TOTALS ------------------

  calculateTableTotals(): void {
    const totals: Record<string, number> = {};

    this.columnFields.forEach(f => (totals[f] = 0));

    this.feeds.forEach(row => {
      this.columnFields.forEach(field => {
        if (typeof row[field] === 'number') {
          totals[field] += Number(row[field]);
        }
      });
    });

    this.tableTotals = totals;
  }
}
