import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { HttpService } from '../../../shared/services/http.service';
import { ToastService } from '../../../shared/services/toast.service';
import { CommonService } from '../../../shared/services/common.service';
import { ConfirmDialogService } from '../../../shared/services/confirm-dialog.service';
import { TranslatePipe } from '../../../i18n/translate.pipe';
import { TranslateService } from '../../../i18n/translate.service';
import { Constants } from '../../../shared/utils/constants/constants';
import { PERMISSIONS } from '../../../core/constants/permissions.constants';
import { API_ENDPOINTS } from '../../../core/constants/api-endpoints';
import { RationAddEditComponent } from '../ration-add-edit/ration-add-edit.component';
import { RationService } from '../../../core/services/ration/ration.service';

interface RationMatrixGroup {
  animalGroupId: string;
  groupName: string;
  rationId: string | null;
  rationName: string | null;
  isActive: boolean;
  costEurPerHead: number;
  kgFm: number;
  kgDm: number;
  pctDm: number;
  items: { feedId: string; kgPerCowPerDay: number; dryMatter?: number; protein?: number; pricePerKg?: number }[];
}

interface RationMatrixFeed {
  feedId: string;
  feedName: string;
}

interface RationArchiveRecord {
  rationArchiveId: string;
  rationId: string;
  rationName: string;
  animalGroupName?: string;
  actionType: string;
  versionNo: number;
  costEurPerHead?: number;
  kgFm?: number;
  kgDm?: number;
  pctDm?: number;
  archivedAt: string;
  items: {
    feedId: string;
    feedName: string;
    feedCategory?: string;
    kgPerCowPerDay?: number;
    dryMatter?: number;
    pricePerKg?: number;
    vatApplicable?: boolean;
    vatPct?: number;
  }[];
}

@Component({
  selector: 'app-ration-list',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule, RationAddEditComponent, TranslatePipe],
  templateUrl: './ration-list.component.html',
  styleUrls: ['./ration-list.component.css']
})
export class RationListComponent implements OnInit, OnDestroy {
  groups: RationMatrixGroup[] = [];
  feeds: RationMatrixFeed[] = [];
  isLoading = false;
  canAdd = false;
  canEdit = false;
  canDelete = false;
  isSuperAdmin = false;
  companies: { id: string; name: string }[] = [];
  selectedCompanyId = '';
  archiveRecords: RationArchiveRecord[] = [];
  isArchiveOpen = false;
  isArchiveLoading = false;

  readonly PAGE_NAME = 'ration-matrix-feeds';

  private subs: Subscription[] = [];

  @ViewChild('rationModal') rationModalRef!: RationAddEditComponent;

  constructor(
    private http: HttpService,
    private toast: ToastService,
    private common: CommonService,
    private confirm: ConfirmDialogService,
    private translate: TranslateService,
    private rationService: RationService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    if (!this.common.checkPermission(PERMISSIONS.RationView, false)) return;

    this.canAdd = this.common.checkPermission(PERMISSIONS.RationAdd, false);
    this.canEdit = this.common.checkPermission(PERMISSIONS.RationEdit, false);
    this.canDelete = this.common.checkPermission(PERMISSIONS.RationDelete, false);
    this.isSuperAdmin = localStorage.getItem(Constants.IsSuperAdmin) === 'true';

    if (this.isSuperAdmin) {
      const sub = this.common.getCompanyDropdown().subscribe(res => {
        this.companies = res?.data ?? [];
        if (this.companies.length > 0) this.selectedCompanyId = this.companies[0].id;
        this.loadMatrix();
      });
      this.subs.push(sub);
    } else {
      this.loadMatrix();
    }

    const sub = this.rationService.rationChanged$.subscribe(() => this.loadMatrix());
    this.subs.push(sub);
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  onCompanyChange(): void {
    this.loadMatrix();
  }

  loadMatrix(): void {
    this.isLoading = true;
    const query = this.isSuperAdmin && this.selectedCompanyId
      ? `?companyId=${this.selectedCompanyId}`
      : '';
    const sub = this.http.get<any>(`${API_ENDPOINTS.RATION.GET_MATRIX}${query}`).subscribe({
      next: (res) => {
        this.groups = res?.data?.groups ?? [];
        this.feeds = res?.data?.feeds ?? [];
        this.isLoading = false;
        this.applyFeedLayout();
      },
      error: () => { this.isLoading = false; }
    });
    this.subs.push(sub);
  }

  onFeedDrop(event: CdkDragDrop<RationMatrixFeed[]>): void {
    moveItemInArray(this.feeds, event.previousIndex, event.currentIndex);
    this.saveFeedLayout();
  }

  private applyFeedLayout(): void {
    const url = `${API_ENDPOINTS.DRAG_AND_DROP.GET}?pageName=${this.PAGE_NAME}`;
    const sub = this.http.get<any>(url).subscribe({
      next: (res) => {
        try {
          const order: string[] = JSON.parse(res?.data ?? '[]');
          if (Array.isArray(order) && order.length > 0) {
            const sorted = order
              .map(id => this.feeds.find(f => f.feedId === id))
              .filter((f): f is RationMatrixFeed => !!f);
            const extras = this.feeds.filter(f => !order.includes(f.feedId));
            this.feeds = [...sorted, ...extras];
          }
        } catch { /* keep default order */ }
      },
      error: () => { /* keep default order */ }
    });
    this.subs.push(sub);
  }

  private saveFeedLayout(): void {
    const payload = {
      pageName:   this.PAGE_NAME,
      layoutJson: JSON.stringify(this.feeds.map(f => f.feedId)),
    };
    this.http.post<any>(API_ENDPOINTS.DRAG_AND_DROP.SAVE, payload).subscribe();
  }

  openArchive(): void {
    this.isArchiveOpen = true;
    this.loadArchive();
  }

  closeArchive(): void {
    this.isArchiveOpen = false;
  }

  loadArchive(rationId?: string | null): void {
    this.isArchiveLoading = true;
    const params: string[] = [];
    if (this.isSuperAdmin && this.selectedCompanyId) {
      params.push(`companyId=${this.selectedCompanyId}`);
    }
    if (rationId) {
      params.push(`rationId=${rationId}`);
    }
    const query = params.length ? `?${params.join('&')}` : '';
    const sub = this.http.get<any>(`${API_ENDPOINTS.RATION.ARCHIVE}${query}`).subscribe({
      next: (res) => {
        this.archiveRecords = res?.data ?? [];
        this.isArchiveLoading = false;
      },
      error: () => {
        this.archiveRecords = [];
        this.isArchiveLoading = false;
      }
    });
    this.subs.push(sub);
  }

  getAmount(group: RationMatrixGroup, feedId: string): string {
    const item = group.items.find(i => i.feedId === feedId);
    if (!item) return '-';
    const v = item.kgPerCowPerDay;
    return Number.isInteger(v) ? v.toString() : v.toString().replace('.', ',');
  }

  viewRationItems(group: RationMatrixGroup): void {
    if (!group.rationId) return;
    this.router.navigate(['/ration/items'], {
      queryParams: { rationId: group.rationId }
    });
  }

  openAddModal(): void {
    this.rationModalRef.openModal(false, undefined, this.selectedCompanyId);
  }

  openEditModal(group: RationMatrixGroup): void {
    if (!group.rationId) return;
    this.rationModalRef.openModal(true, {
      rationId: group.rationId,
      rationName: group.rationName,
      animalGroupId: group.animalGroupId,
      items: group.items.map(i => ({
        feedId: i.feedId,
        perKg: i.kgPerCowPerDay,
        dryMatter: i.dryMatter ?? null,
        protein: i.protein ?? null,
        pricePerKg: i.pricePerKg ?? null,
      }))
    }, this.selectedCompanyId);
  }

  deleteRation(group: RationMatrixGroup): void {
    if (!group.rationId || !this.canDelete) return;
    this.confirm.confirm(this.translate.instant('ration.confirmDelete') ?? '').subscribe(confirmed => {
      if (!confirmed) return;
      const sub = this.rationService.deleteration(group.rationId!).subscribe({
        next: (res: any) => {
          res.isSuccess ? this.toast.success(res.message) : this.toast.error(res.message);
          this.loadMatrix();
        },
        error: () => this.toast.error(this.translate.instant('common.error') ?? 'Error')
      });
      this.subs.push(sub);
    });
  }

  duplicateRation(group: RationMatrixGroup): void {
    if (!group.rationId) return;
    const sub = this.http.post<any>(`${API_ENDPOINTS.RATION.DUPLICATE}?rationId=${group.rationId}`, {}).subscribe({
      next: (res: any) => {
        res.isSuccess ? this.toast.success(res.message) : this.toast.error(res.message);
        if (res.isSuccess) this.loadMatrix();
      },
      error: () => this.toast.error(this.translate.instant('common.error') ?? 'Error')
    });
    this.subs.push(sub);
  }

  fmt(value: number, digits = 2): string {
    return value == null ? '-' : value.toLocaleString('it-IT', {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits
    });
  }

  get activeRationCount(): number {
    return this.groups.filter(group => !!group.rationId).length;
  }

  get totalCostEur(): number {
    return this.groups.reduce((total, group) => total + (Number(group.costEurPerHead) || 0), 0);
  }

  get averageDryMatterPct(): number {
    const values = this.groups
      .map(group => Number(group.pctDm))
      .filter(value => Number.isFinite(value));

    if (values.length === 0) return 0;

    return values.reduce((total, value) => total + value, 0) / values.length;
  }
}
