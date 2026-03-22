// fertilita-list.component.ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReusableTableComponent } from '../../shared/components/reusable-table/reusable-table.component';
import { HttpService } from '../../shared/services/http.service';
import { ToastService } from '../../shared/services/toast.service';
import { ConfirmDialogService } from '../../shared/services/confirm-dialog.service';
import { API_ENDPOINTS } from '../../core/constants/api-endpoints';
import { FertilitaAddEditComponent } from './fertilita-add-edit.component';

@Component({
  selector: 'app-fertilita-list',
  standalone: true,
  imports: [CommonModule, ReusableTableComponent, FertilitaAddEditComponent],
  template: `
    <div class="pagecls">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h3 class="page-title mb-0">Fertilità — Fertility Records</h3>
        <button class="btn add-btn btn-sm" (click)="modal.openModal()">+ Add Record</button>
      </div>
      <div class="table-card">
        <app-reusable-table
          [columns]="columns"
          [columnFields]="columnFields"
          [data]="records"
          [totalRecords]="totalRecords"
          (onEdit)="modal.openModal(true, $event)"
          (onDelete)="onDelete($event)">
        </app-reusable-table>
      </div>
      <app-fertilita-add-edit #modal [farmId]="farmId" (saved)="load()"></app-fertilita-add-edit>
    </div>
  `
})
export class FertilitaListComponent implements OnInit {
  @ViewChild('modal') modal!: FertilitaAddEditComponent;

  farmId!: string;
  records: any[] = [];
  totalRecords = 0;
  columns = ['Date', 'Cow ID', 'Cow Name', 'Event Type', 'Result', 'Bull Code', 'Days in Milk'];
  columnFields = ['recordDate', 'cowId', 'cowName', 'eventType', 'result', 'bullCode', 'daysInMilk'];

  constructor(
    private route: ActivatedRoute,
    private http: HttpService,
    private toast: ToastService,
    private confirm: ConfirmDialogService
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(p => {
      this.farmId = p['farmId'];
      this.load();
    });
  }

  load(): void {
    this.http.post<any>(`${API_ENDPOINTS.FERTILITY_RECORD.GET_ALL}?farmId=${this.farmId}`,
      { pageNo: 1, recordPerPage: 100 })
      .subscribe(res => {
        this.records = res?.data ?? [];
        this.totalRecords = res?.totalRecords ?? 0;
      });
  }

  onDelete(row: any): void {
    this.confirm.confirm('Delete this fertility record?').subscribe(confirmed => {
      if (!confirmed) return;
      this.http.post<any>(
        `${API_ENDPOINTS.FERTILITY_RECORD.DELETE}?fertilityRecordId=${row.fertilityRecordId}`, {})
        .subscribe(res => {
          if (res.isSuccess) { this.toast.success(res.message); this.load(); }
          else this.toast.error(res.message);
        });
    });
  }
}
