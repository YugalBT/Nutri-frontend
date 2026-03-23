import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ReusableTableComponent } from '../../shared/components/reusable-table/reusable-table.component';
import { HttpService } from '../../shared/services/http.service';
import { ToastService } from '../../shared/services/toast.service';
import { ConfirmDialogService } from '../../shared/services/confirm-dialog.service';
import { API_ENDPOINTS } from '../../core/constants/api-endpoints';
import { SanitaAddEditComponent } from './sanita-add-edit.component';
import { TranslatePipe } from '../../i18n/translate.pipe';
import { TranslateService } from '../../i18n/translate.service';

@Component({
  selector: 'app-sanita-list',
  standalone: true,
  imports: [CommonModule, ReusableTableComponent, SanitaAddEditComponent, TranslatePipe],
  template: `
    <div class="pagecls">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h3 class="page-title mb-0">{{ 'sanita.list.title' | translate }}</h3>
        <button class="btn add-btn btn-sm" (click)="modal.openModal()">{{ 'sanita.actions.addEvent' | translate }}</button>
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
      <app-sanita-add-edit #modal [farmId]="farmId" (saved)="load()"></app-sanita-add-edit>
    </div>
  `
})
export class SanitaListComponent implements OnInit, OnDestroy {
  @ViewChild('modal') modal!: SanitaAddEditComponent;

  farmId!: string;
  records: any[] = [];
  totalRecords = 0;
  columns: string[] = [];
  columnFields = ['eventDate', 'cowId', 'eventType', 'diagnosis', 'treatment', 'veterinarianName', 'withholdingDays'];
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
    this.http.post<any>(`${API_ENDPOINTS.HEALTH_EVENT.GET_ALL}?farmId=${this.farmId}`,
      { pageNo: 1, recordPerPage: 100 })
      .subscribe(res => {
        this.records = res?.data ?? [];
        this.totalRecords = res?.totalRecords ?? 0;
      });
  }

  onDelete(row: any): void {
    this.confirm.confirm(this.translate.instant('sanita.messages.deleteConfirm')).subscribe(confirmed => {
      if (!confirmed) return;
      this.http.post<any>(`${API_ENDPOINTS.HEALTH_EVENT.DELETE}?healthEventId=${row.healthEventId}`, {})
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
      this.translate.instant('sanita.columns.date'),
      this.translate.instant('sanita.columns.cowId'),
      this.translate.instant('sanita.columns.eventType'),
      this.translate.instant('sanita.columns.diagnosis'),
      this.translate.instant('sanita.columns.treatment'),
      this.translate.instant('sanita.columns.veterinarian'),
      this.translate.instant('sanita.columns.withholdingDays')
    ];
  }
}
