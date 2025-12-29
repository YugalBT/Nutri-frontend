import { Component } from '@angular/core';
import { Subscription } from 'rxjs';

import { OperatorAddEditComponent } from '../operator-add-edit/operator-add-edit.component';
import { SharedModule } from '../../../shared/shared.module';
import { TranslatePipe } from '../../../i18n/translate.pipe';
import { OperatorList } from '../../../core/models/operator-list';
import { OperatorServiceService } from '../../../core/services/operators/operator-service.service';
import { ToastService } from '../../../shared/services/toast.service';
import { ConfirmDialogService } from '../../../shared/services/confirm-dialog.service';
import { ApiResponse } from '../../../core/models/api-response';
import { ReusableTableComponent } from '../../../shared/components/reusable-table/reusable-table.component';
import { GlobalSearchComponent } from '../../../shared/components/global-search/global-search.component';

@Component({
  selector: 'app-operator-list',
  standalone: true,
  imports: [SharedModule, OperatorAddEditComponent, TranslatePipe, ReusableTableComponent, GlobalSearchComponent],
  templateUrl: './operator-list.component.html',
  styleUrl: './operator-list.component.css'
})
export class OperatorListComponent {

  columns = ['Operator Name', 'Display Name', 'Status'];
  columnFields = ['operatorName', 'operatorDisplayName', 'isActive'];

  operators: OperatorList[] = [];
  totalRecords = 0;
  pageSize = 10;
  pageIndex = 0;
  searchValue = '';
  filterStatus: number | null = 2;

  subs: Subscription[] = [];

  constructor(
    private operatorService: OperatorServiceService,
    private toast: ToastService,
    private confirm: ConfirmDialogService
  ) { }

  ngOnInit(): void {
    this.loadOperators(1, this.pageSize);

    this.subs.push(
      this.operatorService.operatorsChanged$.subscribe(() => {
        this.loadOperators(this.pageIndex + 1, this.pageSize);
      })
    );
  }

  loadOperators(pageNo: number, pageSize: number) {
    const payload = {
      pageNo,
      recordPerPage: pageSize,
      searchValue: this.searchValue,
      status: this.filterStatus
    };

    this.operatorService.getOperatorDetails(payload).subscribe({
      next: (res: ApiResponse<OperatorList[]>) => {
        this.operators = res.data ?? [];
        this.totalRecords = res.totalRecords ?? 0;
      }
    });
  }

  onToggleActive(event: any) {
    const row = event.row;
    const prev = row.isActive;
    row.isToggling = true;

    this.operatorService.activeInActive(row.operatorId).subscribe({
      next: res => {
        res.isSuccess ? row.isActive = !prev : row.isActive = prev;
        res.isSuccess ? this.toast.success(res.message) : this.toast.error(res.message);
      },
      error: () => row.isActive = prev,
      complete: () => row.isToggling = false
    });
  }

  onDelete(row: OperatorList) {
    this.confirm.confirm('Are you sure?').subscribe(confirmed => {
      if (!confirmed) return;

      this.operatorService.deleteTemplateCategory(row.operatorId).subscribe(res => {
        res.isSuccess ? this.toast.success(res.message) : this.toast.error(res.message);
      });
    });
  }

  onSearch(value: string) {
    this.searchValue = value;
    this.loadOperators(1, this.pageSize);
  }

  onStatusChange(status: number | null) {
    this.filterStatus = status ?? 2;
    this.loadOperators(1, this.pageSize);
  }

  clearFilters() {
    this.searchValue = '';
    this.filterStatus = 2;
    this.loadOperators(1, this.pageSize);
  }

  onPageChange(e: any) {
    this.pageIndex = e.pageIndex;
    this.pageSize = e.pageSize;
    this.loadOperators(this.pageIndex + 1, this.pageSize);
  }
}
