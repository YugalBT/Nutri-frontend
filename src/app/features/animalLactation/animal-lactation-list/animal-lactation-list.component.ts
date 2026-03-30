import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { AnimallactationList } from '../../../core/models/animallactation-list';
import { Subscription } from 'rxjs';
import { TranslateService } from '../../../i18n/translate.service';
import { AnimallactationService } from '../../../core/services/animallactation/animallactation.service';
import { ToastService } from '../../../shared/services/toast.service';
import { ConfirmDialogService } from '../../../shared/services/confirm-dialog.service';
import { ApiResponse } from '../../../core/models/api-response';
import { AnimalLactationAddEditComponent } from '../animal-lactation-add-edit/animal-lactation-add-edit.component';
import { SharedModule } from '../../../shared/shared.module';
import { ReusableTableComponent } from '../../../shared/components/reusable-table/reusable-table.component';
import { GlobalSearchComponent } from '../../../shared/components/global-search/global-search.component';
import { CommonService } from '../../../shared/services/common.service';
import { PERMISSIONS } from '../../../core/constants/permissions.constants';
import { TranslatePipe } from '../../../i18n/translate.pipe';
import { PermissionService } from '../../../shared/services/permission.service';
import { Store } from '@ngrx/store';
import { selectUserRoles } from '../../../state/auth/auth.selectors';

@Component({
  selector: 'app-animal-lactation-list',
  standalone: true,
  imports: [CommonModule, SharedModule, AnimalLactationAddEditComponent, ReusableTableComponent, GlobalSearchComponent, TranslatePipe],
  templateUrl: './animal-lactation-list.component.html',
  styleUrls: ['./animal-lactation-list.component.css']
})
export class AnimalLactationListComponent implements OnInit, OnDestroy {

  columns: string[] = [];
  columnFields: string[] = [];

  days: AnimallactationList[] = [];
  totalRecords = 0;
  pageSize = 10;
  pageIndex = 0;
  searchValue = '';
  filterStatus: number | null = 2;

  // Permissions
  canAddAnimalLactation = false;
  viewPermission = PERMISSIONS.AnimalLactationView;
  editPermission = PERMISSIONS.AnimalLactationEdit;
  deletePermission = PERMISSIONS.AnimalLactationDelete;
  userRoles: string[] = [];

  subs: Subscription[] = [];
  langSub!: Subscription;


  constructor(
    private translate: TranslateService,
    private animallactationService: AnimallactationService,
    private toast: ToastService,
    private confirm: ConfirmDialogService,
    private commonService : CommonService,
    private translateService: TranslateService,
    private permissionService: PermissionService,
    private store: Store
  ) {
    this.setColumns();
    this.langSub = this.translate.lang$.subscribe(() => this.setColumns());
  }

  ngOnInit(): void {
    this.loadUserPermissions();

    if(!this.commonService.checkPermission(PERMISSIONS.AnimalLactationView))
      return;

    this.loadAnimalLactation(1, this.pageSize);

    const sub = this.animallactationService.animalLactationsChanged$.subscribe(() => {
      this.loadAnimalLactation(this.pageIndex + 1, this.pageSize);
    });
    this.subs.push(sub);
  }

  private loadUserPermissions(): void {
    const subRoles = this.store.select(selectUserRoles).subscribe(roles => {
      this.userRoles = roles || [];
      this.canAddAnimalLactation = this.userRoles.includes(PERMISSIONS.AnimalLactationAdd);
    });
    this.subs.push(subRoles);
  }

  private loadAnimalLactation(pageNo: number, recordPerPage: number): void {
    const payload = {
      pageNo,
      recordPerPage,
      searchValue: this.searchValue ?? '',
      status: this.filterStatus
    };

    const sub = this.animallactationService.getaAnimalLactationDetails(payload).subscribe({
      next: (res: ApiResponse<AnimallactationList[]>) => {
        this.days = res?.data ?? [];
        this.totalRecords = res?.totalRecords ?? 0;
      },
      error: (error: any) => {
        this.days = [];
        this.totalRecords = 0;
      }
    });

    this.subs.push(sub);
  }

  onSearch(value: string): void {
    this.searchValue = value;
    this.pageIndex = 0;
    this.loadAnimalLactation(1, this.pageSize);
  }

  onStatusChange(status: number | null): void {
    this.filterStatus = status ?? 2;
    this.pageIndex = 0;
    this.loadAnimalLactation(1, this.pageSize);
  }

  clearFilters(): void {
    this.searchValue = '';
    this.filterStatus = 2;
    this.pageIndex = 0;
    this.loadAnimalLactation(1, this.pageSize);
  }

  onPageChange(event: { pageIndex: number; pageSize: number }): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadAnimalLactation(this.pageIndex + 1, this.pageSize);
  }

  onToggleActive(event: { row: any; isActive: boolean }): void {
    event.row.isToggling = true;

    const id = event?.row?.animalLactationId ?? event?.row?.animalLactationId; 
    if (!id) {
      this.toast.error("Invalid id");
      return;
    }

    const sub = this.animallactationService.activeInActive(id).subscribe({
      next: (res: any) => {
        if (res.isSuccess) {
          this.toast.success(res.message);
          event.row.isActive = !event.row.isActive;
        } else {
          this.toast.error(res.message);
        }
      },
      error: () => {},
      complete: () => event.row.isToggling = false
    });

    this.subs.push(sub);
  }

  onDelete(row: any): void {
    const id = row?.animalLactationId ?? row?.dayId;
    if (!id) {
      this.toast.error("Invalid id");
      return;
    }

    this.confirm.confirm("Are you sure you want to delete this record?").subscribe((confirmed) => {
      if (!confirmed) return;

      const sub = this.animallactationService.deleteAnimalLactations(id).subscribe({
        next: (res: any) => {
          res.isSuccess ? this.toast.success(res.message) : this.toast.error(res.message);
          this.animallactationService.notifyanimalLactationsChanged();
        },
        error: (err) => this.toast.error(err?.message)
      });

      this.subs.push(sub);
    });
  }

  private setColumns(): void {
    this.columns = [
      this.translateService.instant('animalLactationStage.columns.lactationNameEn') ?? 'Lactation Name',
      this.translateService.instant('common.status') ?? 'Status'
    ];

    this.columnFields = [
      'lactationNameEn',
      'isActive'
    ];
  }

  ngOnDestroy(): void {
    this.langSub?.unsubscribe();
    this.subs.forEach(s => s.unsubscribe());
  }
}
