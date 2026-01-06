import { Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '../../../i18n/translate.service';
import { TranslatePipe } from '../../../i18n/translate.pipe';
import { LanguageService } from '../../../core/services/language/language.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ApiResponse } from '../../../core/models/api-response';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { ToastService } from '../../../shared/services/toast.service';
import { ConfirmDialogService } from '../../../shared/services/confirm-dialog.service';
import { GlobalSearchComponent } from '../../../shared/components/global-search/global-search.component';
import { ReusableTableComponent } from '../../../shared/components/reusable-table/reusable-table.component';
import { CommonService } from '../../../shared/services/common.service';
//import { PERMISSIONS } from '../../../core/constants/permissions.constants';
import { LanguageAddEditComponent } from '../language-add-edit/language-add-edit.component';


@Component({
  selector: 'app-language-list',
  standalone: true,
  imports: [
    TranslatePipe,
    GlobalSearchComponent,
    ReusableTableComponent,
    LanguageAddEditComponent
  ],
  templateUrl: './language-list.component.html',
  styleUrls: ['./language-list.component.css']
})
export class LanguageListComponent implements OnInit, OnDestroy {

  columns: string[] = [];
  columnFields: string[] = [];
  languages: any[] = [];

  totalRecords = 0;
  pageSize = 10;
  pageIndex = 0;

  searchValue = '';
  filterStatus: number | null = null;

  private subs: Subscription[] = [];
  private langSub: Subscription | undefined;
  private searchDebounce: any;

  constructor(
    private translate: TranslateService,
    private languageService: LanguageService,
    private spinner: NgxSpinnerService,
    private toast: ToastService,
    private confirm: ConfirmDialogService,
  ) {
    this.setColumns();
    this.langSub = this.translate.lang$.subscribe(() => this.setColumns());
    //this.langSub = this.translate.lang$.subscribe(() => this.setColumns());
  }

  // --------------------------------------------------
  // INIT
  // --------------------------------------------------
  ngOnInit(): void {

    // if (!this.commonService.checkPermission(PERMISSIONS.KpiView))
    //   return;

    this.loadLanguages(this.pageIndex + 1, this.pageSize);

    this.languageService.languagesChanged$?.subscribe(() => {
      this.reloadLanguages();
    });
  }

  // --------------------------------------------------
  // COLUMNS
  // --------------------------------------------------
  private setColumns(): void {
    this.columns = [
      this.translate.instant('language.columns.name') || 'Language Name',
      this.translate.instant('language.columns.code') || 'Code',
      this.translate.instant('language.columns.status') || 'Status'
    ];

    this.columnFields = [
      'languageName',
      'languageCode',
      'isActive'
    ];
  }

  // --------------------------------------------------
  // LOAD
  // --------------------------------------------------
  private loadLanguages(pageNo: number, recordPerPage: number): void {

    const payload = {
      searchValue: this.searchValue ?? '',
      pageNo,
      recordPerPage,
      status: this.filterStatus ?? 2
    };

    this.spinner.show();

    const sub = this.languageService.getLanguagesDetails(payload)
      .pipe(finalize(() => this.spinner.hide()))
      .subscribe({
        next: (res: ApiResponse<any>) => {
          this.languages = res?.data ?? [];
          this.totalRecords = res?.totalRecords ?? this.languages.length;
        },
        error: () => {
          this.languages = [];
          this.totalRecords = 0;
          this.toast.error('Failed to load languages');
        }
      });

    this.subs.push(sub);
  }

  // --------------------------------------------------
  // SEARCH / FILTER
  // --------------------------------------------------
  onSearch(value: string): void {
    this.searchValue = value;

    if (this.searchDebounce) clearTimeout(this.searchDebounce);

    this.searchDebounce = setTimeout(() => {
      this.pageIndex = 0;
      this.loadLanguages(1, this.pageSize);
    }, 400);
  }

  onStatusChange(value: any): void {
    this.filterStatus = value === '' ? null : Number(value);
    this.pageIndex = 0;
    this.loadLanguages(1, this.pageSize);
  }

  clearFilters(): void {
    this.searchValue = '';
    this.filterStatus = null;
    this.pageIndex = 0;
    this.loadLanguages(1, this.pageSize);
  }

  onPageChange(event: { pageIndex: number; pageSize: number }): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadLanguages(this.pageIndex + 1, this.pageSize);
  }

  // --------------------------------------------------
  // ACTIONS
  // --------------------------------------------------
  deleteLanguage(row: any): void {

    // if (!this.commonService.checkPermission(PERMISSIONS.KpiDelete))
    //   return;

    const id = row?.languageId;
    if (!id) {
      this.toast.error('Invalid Language ID');
      return;
    }

    this.confirm.confirm(`Are you sure you want to delete "${row.languageName}"?`)
      .subscribe(confirmed => {
        if (!confirmed) return;

        const sub = this.languageService.deleteLanguages(id).subscribe({
          next: res => {
            res?.isSuccess
              ? this.toast.success(res.message)
              : this.toast.error(res.message);

            this.loadLanguages(1, this.pageSize);
          },
          error: err =>
            this.toast.error(err?.error?.message || 'Something went wrong')
        });

        this.subs.push(sub);
      });
  }

  toggleLanguageStatus(event: any): void {
    const row = event.row;
    const newStatus = event.isActive;

    this.languageService.activeInActive(row.languageId)
      .subscribe({
        next: () => {
          row.isActive = newStatus;
          this.toast.success('Status updated successfully');
          this.loadLanguages(this.pageIndex + 1, this.pageSize);
        },
        error: () => this.toast.error('Failed to update status')
      });
  }

  reloadLanguages(): void {
    this.loadLanguages(this.pageIndex + 1, this.pageSize);
  }

  // --------------------------------------------------
  // DESTROY
  // --------------------------------------------------
  ngOnDestroy(): void {
    this.langSub?.unsubscribe();
    this.subs.forEach(s => s.unsubscribe());
  }
}
