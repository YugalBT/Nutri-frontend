// ══════════════════════════════════════════════════════════════════
// parti-list.component.ts   (calvings log)
// ══════════════════════════════════════════════════════════════════
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReusableTableComponent } from '../../shared/components/reusable-table/reusable-table.component';
import { HttpService } from '../../shared/services/http.service';
import { ToastService } from '../../shared/services/toast.service';
import { ConfirmDialogService } from '../../shared/services/confirm-dialog.service';
import { API_ENDPOINTS } from '../../core/constants/api-endpoints';
import { PartiAddEditComponent } from './parti-add-edit.component';

@Component({
  selector: 'app-parti-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReusableTableComponent, PartiAddEditComponent],
  template: `
    <div class="pagecls">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h3 class="page-title mb-0">Parti — Calvings Log</h3>
        <button class="btn add-btn btn-sm" (click)="modal.openModal()">+ Add Calving</button>
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
      <app-parti-add-edit #modal [farmId]="farmId" (saved)="load()"></app-parti-add-edit>
    </div>
  `
})
export class PartiListComponent implements OnInit {
  @ViewChild('modal') modal!: PartiAddEditComponent;

  farmId!: string;
  records: any[] = [];
  totalRecords = 0;
  columns = ['Date', 'Cow ID', 'Cow Name', 'Calf Gender', 'Type', 'Outcome', 'Weight kg'];
  columnFields = ['calvingDate', 'cowId', 'cowName', 'calfGender', 'calvingType', 'calvingOutcome', 'calfWeightKg'];

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
    const payload = { pageNo: 1, recordPerPage: 100 };
    this.http.post<any>(`${API_ENDPOINTS.CALVING.GET_ALL}?farmId=${this.farmId}`, payload)
      .subscribe(res => {
        this.records = res?.data ?? [];
        this.totalRecords = res?.totalRecords ?? 0;
      });
  }

  onDelete(row: any): void {
    this.confirm.confirm('Delete this calving record?').subscribe(confirmed => {
      if (!confirmed) return;
      this.http.post<any>(`${API_ENDPOINTS.CALVING.DELETE}?calvingId=${row.calvingId}`, {})
        .subscribe(res => {
          if (res.isSuccess) { this.toast.success(res.message); this.load(); }
          else this.toast.error(res.message);
        });
    });
  }
}
