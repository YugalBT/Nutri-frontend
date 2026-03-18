import { Component, Input, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { FeedService } from '../../../core/services/feed/feed.service';
import { ToastService } from '../../../shared/services/toast.service';
import { ConfirmDialogService } from '../../../shared/services/confirm-dialog.service';
import { FeedList } from '../../../core/models/feed-list';
import { TranslateService } from '../../../i18n/translate.service';
import { ApiResponse } from '../../../core/models/api-response';
import { SharedModule } from '../../../shared/shared.module';
import { ReusableTableComponent } from '../../../shared/components/reusable-table/reusable-table.component';
import { GlobalSearchComponent } from '../../../shared/components/global-search/global-search.component';
import { FeedAddEditComponent } from "../feed-add-edit/feed-add-edit.component";
import { CommonService } from '../../../shared/services/common.service';
import { PERMISSIONS } from '../../../core/constants/permissions.constants';
import { TranslatePipe } from '../../../i18n/translate.pipe';

@Component({
  selector: 'app-feed-list',
  standalone: true,
  imports: [SharedModule, ReusableTableComponent, GlobalSearchComponent, FeedAddEditComponent, TranslatePipe],
  templateUrl: './feed-list.component.html',
  styleUrls: ['./feed-list.component.css']
})
export class FeedListComponent {

  columns: string[] = [];
  columnFields: string[] = [];
  @Input() farmId!: string;

  feeds: FeedList[] = [];
  totalRecords = 0;
  pageSize = 10;
  pageIndex = 0;
  searchValue = '';
  filterStatus: number | null = 2;

  subs: Subscription[] = [];
  langSub!: Subscription;
  @ViewChild(FeedAddEditComponent) feedModalRef!: FeedAddEditComponent;


  constructor(
    private translate: TranslateService,
    private feedService: FeedService,
    private toast: ToastService,
    private confirm: ConfirmDialogService,
    private commonService: CommonService
  ) {
    this.setColumns();
    this.langSub = this.translate.lang$.subscribe(() => this.setColumns());
  }

  ngOnInit(): void {
    this.searchValue = this.farmId || '';
    if (!this.commonService.checkPermission(PERMISSIONS.FeedView)
      || !this.commonService.checkPermission(PERMISSIONS.FeedDelete))
      return;
    this.loadFeeds(1, this.pageSize);

    const sub = this.feedService.feedsChanged$.subscribe(() => {
      this.loadFeeds(this.pageIndex + 1, this.pageSize);
    });
    this.subs.push(sub);
  }

  private loadFeeds(pageNo: number, recordPerPage: number): void {
    const payload = {
      pageNo,
      recordPerPage,
      searchValue: this.searchValue ?? '',
      status: this.filterStatus
    };

    const sub = this.feedService.getFeedDetails(payload).subscribe({
      next: (res: ApiResponse<any>) => {
        this.feeds = res?.data ?? [];
        this.totalRecords = res?.totalRecords ?? 0;
      },
      error: () => {
        this.feeds = [];
      }
    });

    this.subs.push(sub);
  }

  onSearch(value: string): void {
    this.searchValue = value;
    this.pageIndex = 0;
    this.loadFeeds(1, this.pageSize);
  }

  onStatusChange(status: number | null): void {
    this.filterStatus = status ?? 2;
    this.pageIndex = 0;
    this.loadFeeds(1, this.pageSize);
  }

  clearFilters(): void {
    this.searchValue = '';
    this.filterStatus = 2;
    this.pageIndex = 0;
    this.loadFeeds(1, this.pageSize);
  }

  onPageChange(event: { pageIndex: number; pageSize: number }): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadFeeds(this.pageIndex + 1, this.pageSize);
  }

  onToggleActive(event: { row: any; isActive: boolean }): void {
    event.row.isToggling = true;

    const id = event?.row?.feedId;
    if (!id) {
      this.toast.error("Invalid feed id");
      return;
    }

    const sub = this.feedService.activeInActive(id).subscribe({
      next: (res: ApiResponse<any>) => {
        if (res.isSuccess) {
          this.toast.success(res.message);
          event.row.isActive = !event.row.isActive;
        } else {
          this.toast.error(res.message);
        }
      },
      error: () => { },
      complete: () => event.row.isToggling = false
    });

    this.subs.push(sub);
  }

  onDelete(row: any): void {

    if (!this.commonService.checkPermission(PERMISSIONS.FeedDelete))
      return;
    const id = row?.feedId;
    if (!id) {
      this.toast.error("Invalid feed id");
      return;
    }

    this.confirm.confirm("Are you sure you want to delete this feed?")
      .subscribe((confirmed) => {
        if (!confirmed) return;

        const sub = this.feedService.deleteFeeds(id).subscribe({
          next: (res: ApiResponse<any>) => {
            res.isSuccess ? this.toast.success(res.message) : this.toast.error(res.message);
            this.feedService.notifyfeedsChanged();
          },
          error: (err) => this.toast.error(err?.message)
        });

        this.subs.push(sub);
      });
  }

  private setColumns(): void {
    this.columns = [
      this.translate.instant('feed.columns.feed') ?? " ",
      this.translate.instant('feed.columns.category') ?? " ",
      this.translate.instant('feed.columns.dm') ?? " ",
      this.translate.instant('feed.columns.cp') ?? " ",
      this.translate.instant('feed.columns.ndf') ?? " ",
      this.translate.instant('feed.columns.energy') ?? " ",
      this.translate.instant('feed.columns.price') ?? " ",
      this.translate.instant('feed.columns.phosphorus') ?? " ",
      this.translate.instant('feed.columns.starch') ?? " ",
      this.translate.instant('common.status') ?? " "
    ];


    this.columnFields = [
      'feedName',
      'category',
      'dryMatter',
      'protein',
      'ndf',
      'energy',
      'pricePerKg',
      'phosphorus',
      'starch',
      'isActive'
    ];
  }


  ngOnDestroy(): void {
    this.langSub?.unsubscribe();
    this.subs.forEach(s => s.unsubscribe());
  }

  openAddFeedModal(): void {
  this.feedModalRef.openModal(false, {
    farmId: this.farmId
  });
}

  
}
