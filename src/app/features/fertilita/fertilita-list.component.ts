import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ReusableTableComponent } from '../../shared/components/reusable-table/reusable-table.component';
import { HttpService } from '../../shared/services/http.service';
import { ToastService } from '../../shared/services/toast.service';
import { ConfirmDialogService } from '../../shared/services/confirm-dialog.service';
import { API_ENDPOINTS } from '../../core/constants/api-endpoints';
import { FertilitaAddEditComponent } from './fertilita-add-edit.component';
import { TranslatePipe } from '../../i18n/translate.pipe';
import { TranslateService } from '../../i18n/translate.service';

@Component({
  selector: 'app-fertilita-list',
  standalone: true,
  imports: [CommonModule, ReusableTableComponent, FertilitaAddEditComponent, TranslatePipe],
  template: `
    <div class="pagecls">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h3 class="page-title mb-0">{{ 'fertilita.list.title' | translate }}</h3>
        <button class="btn add-btn btn-sm" (click)="modal.openModal()">{{ 'fertilita.actions.addRecord' | translate }}</button>
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
      <app-fertilita-add-edit #modal (saved)="load()"></app-fertilita-add-edit>
    </div>
  `
})
export class FertilitaListComponent implements OnInit, OnDestroy {
  @ViewChild('modal') modal!: FertilitaAddEditComponent;

  records: any[] = [];
  totalRecords = 0;
  columns: string[] = [];
  columnFields = ['recordDate', 'cowId', 'cowName', 'eventType', 'result', 'bullCode', 'daysInMilk'];
  private langSub?: Subscription;

  constructor(
    private http: HttpService,
    private toast: ToastService,
    private confirm: ConfirmDialogService,
    private translate: TranslateService
  ) {
    this.setColumns();
    this.langSub = this.translate.lang$.subscribe(() => this.setColumns());
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.http.post<any>(API_ENDPOINTS.FERTILITY_RECORD.GET_ALL,
      { pageNo: 1, recordPerPage: 100 })
      .subscribe(res => {
        this.records = res?.data ?? [];
        this.totalRecords = res?.totalRecords ?? 0;
      });
  }

  onDelete(row: any): void {
    this.confirm.confirm(this.translate.instant('fertilita.messages.deleteConfirm')).subscribe(confirmed => {
      if (!confirmed) return;
      this.http.post<any>(
        `${API_ENDPOINTS.FERTILITY_RECORD.DELETE}?fertilityRecordId=${row.fertilityRecordId}`, {})
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
      this.translate.instant('fertilita.columns.date'),
      this.translate.instant('fertilita.columns.cowId'),
      this.translate.instant('fertilita.columns.cowName'),
      this.translate.instant('fertilita.columns.eventType'),
      this.translate.instant('fertilita.columns.result'),
      this.translate.instant('fertilita.columns.bullCode'),
      this.translate.instant('fertilita.columns.daysInMilk')
    ];
  }
}
