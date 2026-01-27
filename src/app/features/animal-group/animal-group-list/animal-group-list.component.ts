// animal-group-list.component.ts
import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { AnimalGroupService } from '../../../core/services/animal-group/animal-group.service';
import { ToastService } from '../../../shared/services/toast.service';
import { ConfirmDialogService } from '../../../shared/services/confirm-dialog.service';
import { ApiResponse } from '../../../core/models/api-response';
import { PERMISSIONS } from '../../../core/constants/permissions.constants';
import { Store } from '@ngrx/store';
import { selectUserRoles } from '../../../state/auth/auth.selectors';
import { AnimalGroupAddEditComponent } from '../animal-group-add-edit/animal-group-add-edit.component';
import { GlobalSearchComponent } from '../../../shared/components/global-search/global-search.component';
import { ReusableTableComponent } from '../../../shared/components/reusable-table/reusable-table.component';
import { TranslatePipe } from '../../../i18n/translate.pipe';
import { TranslateService } from '../../../i18n/translate.service';

@Component({
  selector: 'app-animal-group-list',
  standalone: true,
  imports: [
    AnimalGroupAddEditComponent,
    GlobalSearchComponent,
    ReusableTableComponent,
    TranslatePipe,
  ],
  templateUrl: './animal-group-list.component.html',
  styleUrls: ['./animal-group-list.component.css'],
})
export class AnimalGroupListComponent implements OnInit, OnDestroy {
  @ViewChild('animalGroupModal')
  animalGroupModalRef!: AnimalGroupAddEditComponent;
  @Input() farmId!: string;
  columns: string[] = [];
  columnFields: string[] = [];

  animalGroups: any[] = [];
  totalRecords = 0;
  pageSize = 10;
  pageIndex = 0;
  searchValue = '';
  filterStatus: number | null = 2;

  private subs: Subscription[] = [];

  // permissions
  canAdd = false;
  canEdit = false;
  canDelete = false;
  langSub: any;

  constructor(
    private animalGroupService: AnimalGroupService,
    private toast: ToastService,
    private confirm: ConfirmDialogService,
    private store: Store,
    private translateService: TranslateService,
  ) {
    this.setColumns();
    this.langSub = this.translateService.lang$.subscribe(() =>
      this.setColumns(),
    );
  }

  ngOnInit(): void {
    this.searchValue = this.farmId || '';
    this.loadUserPermissions();
    this.loadAnimalGroups(1, this.pageSize);

    const s = this.animalGroupService.animalGroupsChanged$.subscribe(() => {
      this.loadAnimalGroups(this.pageIndex + 1, this.pageSize);
    });
    this.subs.push(s);
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }

  private setColumns(): void {
    this.columns = [
      this.translateService.instant('farm.columns.farmName') ?? ' ',
      this.translateService.instant('animalGroup.columns.animalGroupName') ??
        ' ',
      this.translateService.instant('animalGroup.columns.animalType') ?? ' ',
      this.translateService.instant('animalGroup.columns.lactationStage') ??
        ' ',
      this.translateService.instant('animalGroup.columns.noOfAnimals') ?? ' ',
      this.translateService.instant('animalGroup.columns.avgMilkPerDay') ?? ' ',
      this.translateService.instant('common.status') ?? ' ',
    ];

    this.columnFields = [
      'farmName',
      'animalGroupNameEn',
      'typeNameEn',
      'lactationNameEn',
      'numberOfAnimal',
      'avgMilkPerDay',
      'isActive',
    ];
  }

  private loadUserPermissions(): void {
    const s = this.store.select(selectUserRoles).subscribe((roles) => {
      const userRoles = roles || [];
      this.canAdd = userRoles.includes(PERMISSIONS.AnimalGroupAdd);
      this.canEdit = userRoles.includes(PERMISSIONS.AnimalGroupEdit);
      this.canDelete = userRoles.includes(PERMISSIONS.AnimalGroupDelete);
    });
    this.subs.push(s);
  }

  loadAnimalGroups(pageNo: number, recordPerPage: number): void {
    const payload: any = {
      pageNo,
      recordPerPage,
      searchValue: this.searchValue || '',
      status: this.filterStatus,
    };

    const s = this.animalGroupService.getAnimalGroupDetails(payload).subscribe({
      next: (res: ApiResponse<any>) => {
        this.animalGroups = res?.data ?? [];
        this.totalRecords = res?.totalRecords ?? 0;
      },
      error: () => {
        this.animalGroups = [];
      },
    });
    this.subs.push(s);
  }

  onSearch(value: string): void {
    this.searchValue = value;
    this.pageIndex = 0;
    this.loadAnimalGroups(1, this.pageSize);
  }

  onStatusChange(status: number | null): void {
    this.filterStatus = status === null ? 2 : status;
    this.pageIndex = 0;
    this.loadAnimalGroups(1, this.pageSize);
  }

  onPageChange(event: { pageIndex: number; pageSize: number }): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadAnimalGroups(this.pageIndex + 1, this.pageSize);
  }

  onToggleActive(event: { row: any; isActive: boolean }): void {
    event.row.isToggling = true;
    const id = event.row?.animalGroupId;
    if (!id) {
      this.toast.error('Invalid id');
      event.row.isToggling = false;
      return;
    }

    const s = this.animalGroupService.activeInActive(id).subscribe({
      next: (res: ApiResponse<any>) => {
        if (res.isSuccess) {
          this.toast.success(res.message);
          event.row.isActive = !event.row.isActive;
        } else {
          this.toast.error(res.message);
        }
      },
      error: (err) => this.toast.error(err?.error?.message),
      complete: () => (event.row.isToggling = false),
    });
    this.subs.push(s);
  }

  onDelete(row: any): void {
    const id = row?.animalGroupId;
    if (!id) {
      this.toast.error('Invalid id');
      return;
    }

    this.confirm
      .confirm(
        this.translateService.instant('common.ConfirmDelete') ||
          'Are you sure you want to delete this record?',
      )
      .subscribe((confirmed) => {
        if (!confirmed) return;

        const s = this.animalGroupService.deleteAnimalGroup(id).subscribe({
          next: (res: ApiResponse<any>) => {
            if (res?.isSuccess) {
              this.toast.success(res?.message);
              this.animalGroupService.notifyanimalGroupsChanged();
            } else {
              this.toast.error(res?.message);
            }
          },
          error: (err) => this.toast.error(err?.error?.message),
        });
        this.subs.push(s);
      });
  }

  // called when modal emits saved event
  onModalSaved(): void {
    this.loadAnimalGroups(1, this.pageSize);
  }
  openAddModal(): void {
  this.animalGroupModalRef.openModal(false, {
    farmId: this.farmId 
  });
}
}
