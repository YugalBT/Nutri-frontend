import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { FeedService } from '../../../core/services/feed/feed.service';
import { ToastService } from '../../../shared/services/toast.service';
import { ConfirmDialogService } from '../../../shared/services/confirm-dialog.service';
import { FeedList } from '../../../core/models/feed-list';  // Adjust this import based on actual FeedList model
import { TranslateService } from '../../../i18n/translate.service';
import { TranslatePipe } from '../../../i18n/translate.pipe';
import { ReusableTableComponent } from '../../../shared/components/reusable-table/reusable-table.component';
import { GlobalSearchComponent } from '../../../shared/components/global-search/global-search.component';
import { ApiResponse } from '../../../core/models/api-response';
import { FeedAddEditComponent } from '../feed-add-edit/feed-add-edit.component';
import { SharedModule } from '../../../shared/shared.module';
import { FarmAddEditComponent } from "../../farm/farm-add-edit/farm-add-edit.component";

@Component({
  selector: 'app-feed-list',
  standalone: true,
  imports: [SharedModule, ReusableTableComponent, GlobalSearchComponent, FarmAddEditComponent],
  templateUrl: './feed-list.component.html',
  styleUrls: ['./feed-list.component.css']
})
export class FeedListComponent {

  // Table Config
  columns: string[] = [];
  columnFields: string[] = [];

  // Data & Pagination
  feeds: FeedList[] = [];
  totalRecords = 0;
  pageSize = 5;
  pageIndex = 0;
  searchValue = '';
  filterStatus: number | null = 2;

  private subs: Subscription[] = [];
  private langSub: Subscription | undefined;

  constructor(
    private translate: TranslateService,
    private feedService: FeedService,
    private toast: ToastService,
    private confirm: ConfirmDialogService
  ) {
    this.setColumns();
    this.langSub = this.translate.lang$.subscribe(() => this.setColumns());
  }

  ngOnInit(): void {
    this.loadFeeds(1, this.pageSize);
    const sub = this.feedService.farmsChanged$.subscribe(() => {
      this.loadFeeds(this.pageIndex + 1, this.pageSize);
    });
    this.subs.push(sub);
  }

  private loadFeeds(pageNo: number, recordPerPage: number): void {
    const payload: any = {
      pageNo,
      recordPerPage,
      searchValue: this.searchValue || '',
      status: this.filterStatus
    };

    const sub = this.feedService.getFeedDetails(payload)
      .subscribe({
        next: (res :ApiResponse<any>) => {
          this.feeds = res?.data ?? [];
          this.totalRecords = res?.totalRecords ?? 0;
        },
        error: () => this.feeds = []
      });

    this.subs.push(sub);
  }

  onSearch(value: string): void {
    this.searchValue = value;
    this.pageIndex = 0;
    this.loadFeeds(1, this.pageSize);
  }

  onStatusChange(status: number | null): void {
    this.filterStatus = status === null ? 2 : status;
    this.pageIndex = 0;
    this.feeds = [];
    this.loadFeeds(1, this.pageSize);
  }

  onPageChange(event: { pageIndex: number; pageSize: number }): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadFeeds(this.pageIndex + 1, this.pageSize);
  }

  clearFilters(): void {
    this.searchValue = '';
    this.filterStatus = 2;
    this.pageIndex = 0;
    this.feeds = [];
    this.loadFeeds(1, this.pageSize);
  }

  onToggleActive(event: { row: any; isActive: boolean }): void {
    event.row.isToggling = true;

    if (!event?.row?.feedId) {
      this.toast.error(this.translate.instant('feeds.invalidId') ?? "");
      return;
    }

    const sub = this.feedService.activeInActive(event.row.feedId).subscribe({
      next: (res :ApiResponse<any>) => {
        if (res.isSuccess) {
          this.toast.success(res.message);
          event.row.isActive = !event.row.isActive;
        } else {
          this.toast.error(res.message);
        }
      },
      error: (err :ApiResponse<any>) => this.toast.error(err?.message),
      complete: () => event.row.isToggling = false
    });

    this.subs.push(sub);
  }

  onDelete(row: any): void {
    const id = row?.feedId;
    if (!id) {
      this.toast.error(this.translate.instant('feeds.invalidId') ?? "");
      return;
    }

    this.confirm.confirm(this.translate.instant('feeds.confirmDelete') ?? "").subscribe((confirmed) => {
      if (!confirmed) return;

      const sub = this.feedService.deleteFeeds(id).subscribe({
        next: (res :ApiResponse<any>) => {
          res.isSuccess ? this.toast.success(res?.message) : this.toast.error(res?.message);
          this.feedService.notifyfeedsChanged();
        },
        error: (err :ApiResponse<any>) => this.toast.error(err?.message)
      });

      this.subs.push(sub);
    });
  }

  private setColumns(): void {
    this.columns = [
      this.translate.instant('feeds.columns.feedName') ?? "",
      this.translate.instant('feeds.columns.category') ?? "",
      this.translate.instant('feeds.columns.pricePerKg') ?? "",
      this.translate.instant('feeds.columns.status') ?? ""
    ];
    this.columnFields = ['feedName', 'category', 'pricePerKg', 'isActive'];
  }

  ngOnDestroy(): void {
    this.langSub?.unsubscribe();
    this.subs.forEach((s) => s.unsubscribe());
  }

}
