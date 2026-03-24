import { Component, ViewChild, OnDestroy, OnInit } from '@angular/core';
import { ReusableTableComponent } from '../../../shared/components/reusable-table/reusable-table.component';
import { MaterialAddEditComponent } from '../material-add-edit/material-add-edit.component';
import { GlobalSearchComponent } from '../../../shared/components/global-search/global-search.component';
import { Subscription } from 'rxjs';
import { MaterialService } from '../../../core/services/material/material.service';
import { ToastService } from '../../../shared/services/toast.service';
import { ConfirmDialogService } from '../../../shared/services/confirm-dialog.service';
import { TranslateService } from '../../../i18n/translate.service';
import { TranslatePipe } from '../../../i18n/translate.pipe';
import { ApiResponse } from '../../../core/models/api-response';

@Component({
  selector: 'app-material-list',
  standalone: true,
  imports: [
    ReusableTableComponent,
    MaterialAddEditComponent,
    GlobalSearchComponent,
    TranslatePipe
  ],
  templateUrl: './material-list.component.html',
  styleUrl: './material-list.component.css'
})
export class MaterialListComponent implements OnInit, OnDestroy {

  @ViewChild('materialModal') materialModal!: MaterialAddEditComponent;

  columns: string[] = [];
  columnFields: string[] = [
    'materialName',
    'materialCode',
    // 'supplierName',
    'unit',
    'basePrice',
    'isActive'
  ];

  materials: any[] = [];
  totalRecords = 0;
  pageSize = 10;
  pageIndex = 0;
  searchValue = '';
  filterStatus: number | null = 2;

  private subs: Subscription[] = [];

  constructor(
    private materialService: MaterialService,
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
      this.translate.instant('material.name'),
      this.translate.instant('material.code'),
      //this.translate.instant('material.supplier'),
      this.translate.instant('material.unit'),
      this.translate.instant('material.basePrice'),
      this.translate.instant('common.status')
    ];
  }

  ngOnInit(): void {

    this.loadMaterials(1, this.pageSize);

    const sub = this.materialService.materialsChanged$
      .subscribe(() => {
        this.loadMaterials(this.pageIndex + 1, this.pageSize);
      });

    this.subs.push(sub);
  }

  private loadMaterials(pageNo: number, recordPerPage: number): void {

    const payload = {
      pageNo,
      recordPerPage,
      searchValue: this.searchValue || '',
      status: this.filterStatus
    };

    const sub = this.materialService.getMaterials(payload)
      .subscribe({
        next: (res) => {
          this.materials = res?.data ?? [];
          this.totalRecords = res?.totalRecords ?? 0;
        },
        error: () => this.materials = []
      });

    this.subs.push(sub);
  }
exportMaterials(): void {

  const sub = this.materialService.exportMaterials()
    .subscribe((res) => {

      if (!res?.isSuccess || !res?.data) {
        this.toast.error('Export failed');
        return;
      }

      // 🔥 Direct Base64 → Blob (short method)
      const blob = new Blob(
        [Uint8Array.from(atob(res.data), c => c.charCodeAt(0))],
        { type: 'text/csv;charset=utf-8;' }
      );

      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = 'materials.csv';
      link.click();

      URL.revokeObjectURL(url);

      this.toast.success('Materials exported successfully');
    });

  this.subs.push(sub);
}

exportSampleCSV(): void {

  const sub = this.materialService.exportSampleCSV()
    .subscribe((res) => {

      if (!res?.isSuccess || !res?.data) {
        this.toast.error('Export failed');
        return;
      }

      // 🔥 Direct Base64 → Blob (short method)
      const blob = new Blob(
        [Uint8Array.from(atob(res.data), c => c.charCodeAt(0))],
        { type: 'text/csv;charset=utf-8;' }
      );

      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = 'materials.csv';
      link.click();

      URL.revokeObjectURL(url);

      this.toast.success('Materials exported successfully');
    });

  this.subs.push(sub);
}

  onSearch(value: string): void {
    this.searchValue = value;
    this.pageIndex = 0;
    this.loadMaterials(1, this.pageSize);
  }

importMaterials(event: any): void {

  const file = event.target.files[0];
  if (!file) return;

  const sub = this.materialService
    .importMaterials(file)
    .subscribe((res: ApiResponse<any>) => {

      if (res.isSuccess) {
        this.toast.success(res.message);
        this.loadMaterials(1, this.pageSize);
      } else {
        this.toast.error(res.message);
      }

    });

  this.subs.push(sub);

}

  onStatusChange(status: number | null): void {
    this.filterStatus = status === null ? 2 : status;
    this.pageIndex = 0;
    this.loadMaterials(1, this.pageSize);
  }

  onPageChange(event: { pageIndex: number; pageSize: number }): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadMaterials(this.pageIndex + 1, this.pageSize);
  }

  clearFilters(): void {
    this.searchValue = '';
    this.filterStatus = 2;
    this.pageIndex = 0;
    this.loadMaterials(1, this.pageSize);
  }

  onToggleActive(event: { row: any; isActive: boolean }): void {

    if (!event?.row?.materialId) {
      this.toast.error("Invalid Material Id");
      return;
    }

    const sub = this.materialService.activeInActive(event.row.materialId)
      .subscribe({
        next: (res) => {
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

    if (!row?.materialId) {
      this.toast.error("Invalid Material Id");
      return;
    }

    this.confirm.confirm(
      this.translate.instant('common.deleteConfirm')
    ).subscribe((confirmed) => {

      if (!confirmed) return;

      const sub = this.materialService.deleteMaterial(row.materialId)
        .subscribe({
          next: (res) => {
            if (res.isSuccess) {
              this.toast.success(res.message);
              this.materialService.notifyMaterialsChanged();
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
