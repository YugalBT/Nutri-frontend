import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ReusableTableComponent } from '../../shared/components/reusable-table/reusable-table.component';
import { HttpService } from '../../shared/services/http.service';
import { ToastService } from '../../shared/services/toast.service';
import { ConfirmDialogService } from '../../shared/services/confirm-dialog.service';
import { API_ENDPOINTS } from '../../core/constants/api-endpoints';
import { PartiAddEditComponent } from './parti-add-edit.component';
import { TranslatePipe } from '../../i18n/translate.pipe';
import { TranslateService } from '../../i18n/translate.service';

@Component({
  selector: 'app-parti-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReusableTableComponent, PartiAddEditComponent, TranslatePipe],
  template: `
    <div class="pagecls">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h3 class="page-title mb-0">{{ 'parti.list.title' | translate }}</h3>
        <button class="btn add-btn btn-sm" (click)="modal.openModal()">{{ 'parti.actions.addCalving' | translate }}</button>
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
export class PartiListComponent implements OnInit, OnDestroy {
  @ViewChild('modal') modal!: PartiAddEditComponent;

  farmId!: string;
  records: any[] = [];
  totalRecords = 0;
  columns: string[] = [];
  columnFields = ['calvingDate', 'cowId', 'cowName', 'calfGender', 'calvingType', 'calvingOutcome', 'calfWeightKg'];
  private langSub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private http: HttpService,
    private toast: ToastService,
    private confirm: ConfirmDialogService,
    private translate: TranslateService
  ) {
    this.setColumns();
    this.langSub = this.translate.lang$.subscribe(() => this.setColumns());
  }

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
    this.confirm.confirm(this.translate.instant('parti.messages.deleteConfirm')).subscribe(confirmed => {
      if (!confirmed) return;
      this.http.post<any>(`${API_ENDPOINTS.CALVING.DELETE}?calvingId=${row.calvingId}`, {})
        .subscribe(res => {
          if (res.isSuccess) { this.toast.success(res.message); this.load(); }
          else this.toast.error(res.message);
        });
    });
  }

  ngOnDestroy(): void {
    this.langSub?.unsubscribe();
  }

  private setColumns(): void {
    this.columns = [
      this.translate.instant('parti.columns.date'),
      this.translate.instant('parti.columns.cowId'),
      this.translate.instant('parti.columns.cowName'),
      this.translate.instant('parti.columns.calfGender'),
      this.translate.instant('parti.columns.type'),
      this.translate.instant('parti.columns.outcome'),
      this.translate.instant('parti.columns.weightKg')
    ];
  }
}
