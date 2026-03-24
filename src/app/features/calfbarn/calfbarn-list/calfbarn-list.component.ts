import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';

import { CalfbarnService } from '../../../core/services/calfbarn/calfbarn.service';
import { ToastService } from '../../../shared/services/toast.service';
import { ConfirmDialogService } from '../../../shared/services/confirm-dialog.service';

import { GlobalSearchComponent } from '../../../shared/components/global-search/global-search.component';
import { ReusableTableComponent } from '../../../shared/components/reusable-table/reusable-table.component';
import { CalfbarnAddEditComponent } from '../calfbarn-add-edit/calfbarn-add-edit.component';

import { TranslateService } from '../../../i18n/translate.service';
import { TranslatePipe } from '../../../i18n/translate.pipe';

@Component({
  selector: 'app-calfbarn-list',
  standalone: true,
  imports: [
    GlobalSearchComponent,
    ReusableTableComponent,
    CalfbarnAddEditComponent,
    TranslatePipe
  ],
  templateUrl: './calfbarn-list.component.html',
  styleUrl: './calfbarn-list.component.css'
})
export class CalfbarnListComponent implements OnInit, OnDestroy {

  @ViewChild('calfBarnModal') calfBarnModal!: CalfbarnAddEditComponent;

  calfBarn: any[] = [];
  totalRecords = 0;

  pageSize = 10;
  pageIndex = 0;

  searchValue = '';
  filterStatus: number | null = 2;

  columns: string[] = [];

  columnFields: string[] = [
    'animalGroup',
    'calfAgeDays',
    'milkFeed',
    'fiber',
    'feedName',
    "isActive"
  ];

  private subs: Subscription[] = [];

  constructor(
    private calfBarnService: CalfbarnService,
    private toast: ToastService,
    private confirm: ConfirmDialogService,
    private translate: TranslateService
  ) {

    this.setColumns();

    this.translate.lang$.subscribe(() => {
      this.setColumns();
    });

  }

  private setColumns(): void {

    this.columns = [
      this.translate.instant('calfBarn.animalGroup'),
      this.translate.instant('calfBarn.calfAgeDays'),
      this.translate.instant('calfBarn.milkFeed'),
      this.translate.instant('calfBarn.fiber'),
      this.translate.instant('calfBarn.starterFeed'),
      this.translate.instant('common.status'),
    ];

  }

 ngOnInit(): void {

  this.loadData(1, this.pageSize);

  const sub = this.calfBarnService.calfbarnChanged$
    .subscribe(() => {
      this.loadData(this.pageIndex + 1, this.pageSize);
    });

  this.subs.push(sub);
}

  private loadData(pageNo: number, recordPerPage: number): void {

    const payload = {
      pageNo,
      recordPerPage,
      searchValue: this.searchValue || '',
      status: this.filterStatus
    };

    const sub = this.calfBarnService.getcalfbarnDetails(payload)
      .subscribe({
        next: (res: any) => {

          if (res?.isSuccess) {
            this.calfBarn = res.data ?? [];
            this.totalRecords = res.totalRecords ?? 0;
          } else {
            this.calfBarn = [];
          }

        },
        error: () => this.calfBarn = []
      });

    this.subs.push(sub);

  }

  onSearch(value: string): void {

    this.searchValue = value;
    this.pageIndex = 0;

    this.loadData(1, this.pageSize);

  }

  onStatusChange(status: number | null): void {

    this.filterStatus = status === null ? 2 : status;
    this.pageIndex = 0;

    this.loadData(1, this.pageSize);

  }

  onPageChange(event: { pageIndex: number; pageSize: number }): void {

    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;

    this.loadData(this.pageIndex + 1, this.pageSize);

  }

  clearFilters(): void {

    this.searchValue = '';
    this.filterStatus = 2;
    this.pageIndex = 0;

    this.loadData(1, this.pageSize);

  }

  onToggleActive(event: { row: any; isActive: boolean }): void {

    if (!event?.row?.calfBarnId) {
      this.toast.error("Invalid CalfBarn Id");
      return;
    }

    const sub = this.calfBarnService.activeInActive(event.row.calfBarnId)
      .subscribe({
        next: (res: any) => {

          if (res.isSuccess) {

            this.toast.success(res.message);
            event.row.isActive = !event.row.isActive;

          } else {

            this.toast.error(res.message);

          }

        },
        error: (err) => this.toast.error(err?.error?.message)
      });

    this.subs.push(sub);

  }

  onDelete(row: any): void {

    if (!row?.calfBarnId) {
      this.toast.error("Invalid CalfBarn Id");
      return;
    }

    this.confirm.confirm(
      this.translate.instant('common.deleteConfirm')
    ).subscribe((confirmed) => {

      if (!confirmed) return;

      const sub = this.calfBarnService.deletecalfbarn(row.calfBarnId)
        .subscribe({

          next: (res: any) => {

            if (res.isSuccess) {

              this.toast.success(res.message);
              this.loadData(this.pageIndex + 1, this.pageSize);

            } else {

              this.toast.error(res.message);

            }

          },

          error: (err) => this.toast.error(err?.error?.message)

        });

      this.subs.push(sub);

    });

  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

}
