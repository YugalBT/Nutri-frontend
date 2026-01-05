import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ToastService } from '../../../shared/services/toast.service';
import { ConfirmDialogService } from '../../../shared/services/confirm-dialog.service';
import { CommonService } from '../../../shared/services/common.service';
import { PERMISSIONS } from '../../../core/constants/permissions.constants';
import { TechnicalReportAddEditComponent } from '../technical-report-add-edit/technical-report-add-edit.component';
import { TechnicalReportService } from '../../../core/services/technical-report/technical-report.service';
import { ReusableTableComponent } from '../../../shared/components/reusable-table/reusable-table.component';

@Component({
  selector: 'app-technical-report-list',
  standalone: true,
  imports: [
    TechnicalReportAddEditComponent,ReusableTableComponent
  ],
  templateUrl: './technical-report-list.component.html',
  styleUrls: ['./technical-report-list.component.css']
})
export class TechnicalReportListComponent implements OnInit, OnDestroy {

  columns: string[] = [];
  columnFields: string[] = [];

  reports: any[] = [];
  totalRecords = 0;

  pageSize = 10;
  pageIndex = 0;

  subs: Subscription[] = [];

  constructor(
    private reportService: TechnicalReportService,
    private toast: ToastService,
    private confirm: ConfirmDialogService,
    private commonService: CommonService
  ) {
    this.setColumns();
  }

  ngOnInit(): void {

    // if (!this.commonService.checkPermission(PERMISSIONS.TechnicalReportView))
    //   return;

    this.loadReports(1, this.pageSize);

    const sub = this.reportService.technicalReportsChanged$
      .subscribe(() => this.loadReports(this.pageIndex + 1, this.pageSize));

    this.subs.push(sub);
  }

  private loadReports(pageNo: number, recordPerPage: number): void {
    const payload = {
      pageNo,
      recordPerPage
    };

    const sub = this.reportService.getTechnicalReportDetails(payload).subscribe({
      next: res => {
        this.reports = res?.data ?? [];
        this.totalRecords = res?.totalRecords ?? 0;
      },
      error: () => {
        this.reports = [];
      }
    });

    this.subs.push(sub);
  }

  onPageChange(event: { pageIndex: number; pageSize: number }): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadReports(this.pageIndex + 1, this.pageSize);
  }

  onEdit(row: any): void {
    // handled via template reference
  }

  // onToggleActive(event: { row: any; isActive: boolean }): void {

  //   // if (!this.commonService.checkPermission(PERMISSIONS.TechnicalReportEdit)) {
  //   //   this.toast.warning('Permission denied');
  //   //   return;
  //   // }

  //   const id = event.row?.technicalReportId;
  //   if (!id) {
  //     this.toast.error('Invalid report id');
  //     return;
  //   }

  //   event.row.isToggling = true;

  //   const sub = this.reportService.activeInactive(id).subscribe({
  //     next: res => {
  //       if (res.isSuccess) {
  //         this.toast.success(res.message);
  //         event.row.isActive = !event.row.isActive;
  //       } else {
  //         this.toast.error(res.message);
  //       }
  //     },
  //     complete: () => event.row.isToggling = false
  //   });

  //   this.subs.push(sub);
  // }

  // onDelete(row: any): void {

  //   if (!this.commonService.checkPermission(PERMISSIONS.TechnicalReportDelete)) {
  //     this.toast.warning('Permission denied');
  //     return;
  //   }

  //   const id = row?.technicalReportId;
  //   if (!id) {
  //     this.toast.error('Invalid report id');
  //     return;
  //   }

  //   this.confirm.confirm('Are you sure you want to delete this report?')
  //     .subscribe(confirmed => {
  //       if (!confirmed) return;

  //       const sub = this.reportService.deleteReport(id).subscribe({
  //         next: res => {
  //           res.isSuccess
  //             ? this.toast.success(res.message)
  //             : this.toast.error(res.message);

  //           this.reportService.notifyReportChanged();
  //         }
  //       });

  //       this.subs.push(sub);
  //     });
  // }

  private setColumns(): void {
    this.columns = [
      'Feed Name',
      'Quantity (kg)',
      'Total DM',
      'Crude Protein',
      'Energy MJ'
    ];

    this.columnFields = [
      'reportName',
      'reportDate',
      'animalCount',

    ];
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }
}
