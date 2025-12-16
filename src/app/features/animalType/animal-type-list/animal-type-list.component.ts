import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { AnimalTypeAddEditComponent } from '../animal-type-add-edit/animal-type-add-edit.component';
import { ReusableTableComponent } from '../../../shared/components/reusable-table/reusable-table.component';
import { GlobalSearchComponent } from '../../../shared/components/global-search/global-search.component';
import { TranslatePipe } from '../../../i18n/translate.pipe';
import { ConfirmDialogService } from '../../../shared/services/confirm-dialog.service';
import { AnimaltypeService } from '../../../core/services/animaltype/animaltype.service';
import { ToastService } from '../../../shared/services/toast.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { CommonService } from '../../../shared/services/common.service';
import { PERMISSIONS } from '../../../core/constants/permissions.constants';

@Component({
  selector: 'app-animal-type-list',
  standalone: true,
  imports: [
    AnimalTypeAddEditComponent,
    ReusableTableComponent,
    GlobalSearchComponent,
    TranslatePipe
  ],
  templateUrl: './animal-type-list.component.html',
  styleUrl: './animal-type-list.component.css'
})
export class AnimalTypeListComponent implements OnInit, OnDestroy {

  columns: string[] = ['Animal Type(English)','Animal Type(Italian)', 'English Name', 'Status'];
  columnFields: string[] = ['typeNameEn', 'typeNameIt', 'isActive'];

  animalTypes: any[] = [];
  
  totalRecords = 0;
  pageSize = 10;
  pageIndex = 0;

  searchValue = '';
  filterStatus: number | null = null;

  private searchDebounce: any;
  private subs: Subscription[] = [];

  constructor(
    private animalTypeService: AnimaltypeService,
    private spinner: NgxSpinnerService,
    private toast: ToastService,
    private confirm: ConfirmDialogService,
    private commonService : CommonService
  ) {}

ngOnInit() {
  if(!this.commonService.checkPermission(PERMISSIONS.AnimalTypeView))
    return;
  this.loadAnimalTypes(this.pageIndex + 1, this.pageSize);

  this.subs.push(
    this.animalTypeService.animalTypeChanged$.subscribe(() => {
      this.reloadList();
    })
  );
}


  /** Load paginated list */
  private loadAnimalTypes(pageNo: number, recordPerPage: number) {
    const payload = {
      searchValue: this.searchValue ?? '',
      status: this.filterStatus ?? 2,
      pageNo,
      recordPerPage
    };

    this.spinner.show();

    const sub = this.animalTypeService.getAnimalTypes(payload)
      .pipe(finalize(() => this.spinner.hide()))
      .subscribe({
        next: (res: any) => {
          this.animalTypes = res?.data ?? [];
          this.totalRecords = res?.totalRecords ?? this.animalTypes.length;
        },
        error: () => {
          this.animalTypes = [];
          this.totalRecords = 0;
        }
      });

    this.subs.push(sub);
  }

  /** Search */
  onSearch(value: string) {
    this.searchValue = value;

    if (this.searchDebounce) clearTimeout(this.searchDebounce);

    this.searchDebounce = setTimeout(() => {
      this.pageIndex = 0;
      this.loadAnimalTypes(1, this.pageSize);
    }, 400);
  }

  /** Status Filter */
  onStatusChange(value: any) {
    this.filterStatus = value === '' || value === null ? null : Number(value);
    this.pageIndex = 0;
    this.loadAnimalTypes(1, this.pageSize);
  }

  clearFilters() {
    this.searchValue = '';
    this.filterStatus = null;
    this.pageIndex = 0;
    this.loadAnimalTypes(1, this.pageSize);
  }

  /** Pagination */
  onPageChange(event: { pageIndex: number; pageSize: number }) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadAnimalTypes(this.pageIndex + 1, this.pageSize);
  }

  
deleteAnimalType(row: any): void {

  if(!this.commonService.checkPermission(PERMISSIONS.AnimalTypeDelete))
    return;
  const id = row?.animalTypeId;

  if (!id) {
    this.toast.error("Invalid Animal Type ID");
    return;
  }

  this.confirm.confirm(`Are you sure you want to delete "${row.typeNameEn}"?`).subscribe((confirmed) => {
    if (!confirmed) return;

    const sub = this.animalTypeService.deleteAnimalType(id).subscribe({
      next: (res) => {
        res?.isSuccess
          ? this.toast.success(res.message || "Animal Type deleted successfully")
          : this.toast.error(res.message || "Failed to delete");

        this.animalTypeService.notifyChanges(); // auto-reload list
      },
      error: (err) => {
        this.toast.error(err?.error?.message || "Something went wrong");
      }
    });

    this.subs.push(sub);
  });
}


  /** Toggle Status */
  toggleStatus(event: any) {
    const row = event.row;
    const newStatus = event.isActive;

    this.animalTypeService.activeInActiveAnimalType(row.animalTypeId, newStatus).subscribe({
      next: () => {
        row.isActive = newStatus;
        this.toast.success('Status updated successfully');
      },
      error: () => this.toast.error("Failed to update status")
    });
  }

  reloadList() {
    this.loadAnimalTypes(this.pageIndex + 1, this.pageSize);
  }

  ngOnDestroy() {
    this.subs.forEach(x => x.unsubscribe());
  }
}
