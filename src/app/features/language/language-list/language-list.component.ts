import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
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
import { LanguageAddEditComponent } from '../language-add-edit/language-add-edit.component';
import { base64ToBlob, downloadBlob } from '../../../core/helpers/file.helper';
import { NgxSpinnerModule } from 'ngx-spinner';

@Component({
  selector: 'app-language-list',
  standalone: true,
  imports: [
    TranslatePipe,
    GlobalSearchComponent,
    ReusableTableComponent,
    LanguageAddEditComponent,
    NgxSpinnerModule
  ],
  templateUrl: './language-list.component.html',
  styleUrls: ['./language-list.component.css'],
})
export class LanguageListComponent implements OnInit, OnDestroy {

  @ViewChild('importFileInput')
  importFileInput!: ElementRef<HTMLInputElement>;

  selectedCulture = '';

  columns: string[] = [];
  columnFields: string[] = [];
  languages: any[] = [];

  totalRecords = 0;
  pageSize = 10;
  pageIndex = 0;

  searchValue = '';
  filterStatus: number | null = null;

  private subs: Subscription[] = [];
  private langSub?: Subscription;
  private searchDebounce: any;

  constructor(
    private translate: TranslateService,
    private languageService: LanguageService,
    private spinner: NgxSpinnerService,
    private toast: ToastService,
    private confirm: ConfirmDialogService
  ) {
    this.setColumns();
    this.langSub = this.translate.lang$.subscribe(() => this.setColumns());
  }

  // --------------------------------------------------
  // INIT
  // --------------------------------------------------
  ngOnInit(): void {
    this.loadLanguages(1, this.pageSize);

    const langChangedSub =
      this.languageService.languagesChanged$?.subscribe(() => {
        this.reloadLanguages();
      });

    if (langChangedSub) {
      this.subs.push(langChangedSub);
    }
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

    const sub = this.languageService
      .getLanguagesDetails(payload)
      .pipe(finalize(() => this.spinner.hide()))
      .subscribe({
        next: (res: ApiResponse<any>) => {
          this.languages = res?.data ?? [];
          this.totalRecords = res?.totalRecords ?? 0;
        },
        error: () => {
          this.languages = [];
          this.totalRecords = 0;
          this.toast.error(
            this.translate.instant('common.failedToLoadData') ||
            'Failed to load languages'
          );
        }
      });

    this.subs.push(sub);
  }

  // --------------------------------------------------
  // SEARCH / FILTER
  // --------------------------------------------------
  onSearch(value: string): void {
    this.searchValue = value;

    if (this.searchDebounce) {
      clearTimeout(this.searchDebounce);
    }

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
  // DELETE
  // --------------------------------------------------
  deleteLanguage(row: any): void {
    const id = row?.languageId;
    if (!id) {
      this.toast.error('Invalid Language ID');
      return;
    }

    this.confirm
      .confirm(`Are you sure you want to delete "${row.languageName}"?`)
      .subscribe(confirmed => {
        if (!confirmed) return;

        this.spinner.show();

        const sub = this.languageService
          .deleteLanguages(id)
          .pipe(finalize(() => this.spinner.hide()))
          .subscribe({
            next: res => {
              res?.isSuccess
                ? this.toast.success(res.message)
                : this.toast.error(res.message);

              this.reloadLanguages();
            },
            error: err =>
              this.toast.error(err?.error?.message || 'Something went wrong')
          });

        this.subs.push(sub);
      });
  }

  // --------------------------------------------------
  // STATUS TOGGLE
  // --------------------------------------------------
  toggleLanguageStatus(event: any): void {
    const row = event.row;
    const newStatus = event.isActive;

    this.spinner.show();

    this.languageService
      .activeInActive(row.languageId)
      .pipe(finalize(() => this.spinner.hide()))
      .subscribe({
        next: () => {
          row.isActive = newStatus;
          this.toast.success(
            this.translate.instant('common.updated') ||
            'Status updated successfully'
          );
        },
        error: () => {
          row.isActive = !newStatus;
          this.toast.error(
            this.translate.instant('common.error') ||
            'Failed to update status'
          );
        }
      });
  }

  // --------------------------------------------------
  // EXPORT
  // --------------------------------------------------
  exportLanguage(row: any): void {
    const culture = row.languageCode;

    this.spinner.show();

    this.languageService
      .exportLanguage(culture)
      .pipe(finalize(() => this.spinner.hide()))
      .subscribe({
        next: (res) => {
          const base64 = res?.data;
          if (!base64) {
            this.toast.error('Export failed');
            return;
          }

          const blob = base64ToBlob(
            base64,
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          );

          downloadBlob(blob, `Messages.${culture}.xlsx`);
          this.toast.success('Language exported successfully');
        },
        error: () => this.toast.error('Failed to export language')
      });
  }

  // --------------------------------------------------
  // IMPORT
  // --------------------------------------------------
  importLanguage(row: any): void {
    this.selectedCulture = row.languageCode;
    this.importFileInput.nativeElement.value = '';
    this.importFileInput.nativeElement.click();
  }

  onImportFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    if (!file.name.endsWith('.xlsx')) {
      this.toast.warning('Please upload a valid Excel (.xlsx) file');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('culture', this.selectedCulture);

    this.spinner.show();

    this.languageService
      .importLanguage(formData)
      .pipe(finalize(() => this.spinner.hide()))
      .subscribe({
        next: (res) => {
          if (res?.isSuccess) {
            this.toast.success(res.message || 'Language imported successfully');
            this.reloadLanguages();
          } else {
            this.toast.error(res.message || 'Import failed');
          }
        },
        error: () => this.toast.error('Failed to import language')
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
