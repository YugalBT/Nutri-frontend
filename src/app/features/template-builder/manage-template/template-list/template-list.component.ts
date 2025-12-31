import { Subscription } from "rxjs";
import { TemplateList } from "../../../../core/models/template-builder/template-list";
import { ManageTemplateService } from "../../../../core/services/template-builder/manage-template/manage-template.service";
import { ToastService } from "../../../../shared/services/toast.service";
import { Component } from "@angular/core";
import { SharedModule } from "../../../../shared/shared.module";
import { ReusableTableComponent } from "../../../../shared/components/reusable-table/reusable-table.component";
import { GlobalSearchComponent } from "../../../../shared/components/global-search/global-search.component";
import { TranslatePipe } from "../../../../i18n/translate.pipe";
import { TemplateAddEditComponent } from "../template-add-edit/template-add-edit.component";
import { ConfirmDialogService } from "../../../../shared/services/confirm-dialog.service";

@Component({
  selector: 'app-template-list',
  standalone: true,
  imports: [SharedModule,
    ReusableTableComponent,
    GlobalSearchComponent,
    TranslatePipe,
    TemplateAddEditComponent],
  templateUrl: './template-list.component.html',
  styleUrl: './template-list.component.css'
})
export class TemplateListComponent {

  columns: string[] = [];
  columnFields: string[] = [];

  templates: TemplateList[] = [];
  totalRecords = 0;
  pageSize = 10;
  pageIndex = 0;
  searchValue = '';
  filterStatus: number | null = 2;
  subs: Subscription[] = [];

  constructor(
    private templateService: ManageTemplateService,
    private toast: ToastService,
    private confirm: ConfirmDialogService
  ) {
    this.setColumns();
  }

  ngOnInit() {
    this.loadTemplates(1, this.pageSize);

    const sub = this.templateService.templatesChanged$.subscribe(() => {
      this.loadTemplates(this.pageIndex + 1, this.pageSize);
    });

    this.subs.push(sub);
  }

  loadTemplates(pageNo: number, recordPerPage: number) {
    const payload = { pageNo, recordPerPage };

    const sub = this.templateService.gettemplateDetails(payload).subscribe({
      next: res => {
        this.templates = res.data ?? [];
        this.totalRecords = res.totalRecords ?? 0;
      },
      error: () => {
        this.templates = [];
        this.totalRecords = 0;
      }
    });

    this.subs.push(sub);
  }
  onSearch(value: string): void {
    this.searchValue = value;
    this.pageIndex = 0;
    this.loadTemplates(1, this.pageSize);
  }

  onStatusChange(status: number | null): void {
    this.filterStatus = status ?? 2;
    this.pageIndex = 0;
    this.loadTemplates(1, this.pageSize);
  }

  clearFilters(): void {
    this.searchValue = '';
    this.filterStatus = 2;
    this.pageIndex = 0;
    this.loadTemplates(1, this.pageSize);
  }



  onPageChange(event: any) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadTemplates(this.pageIndex + 1, this.pageSize);
  }

  onToggleActive(event: any): void {
    const row = event.row;
    const previousStatus = row.isActive;

    row.isToggling = true;

    this.templateService.activeInActive(row.id).subscribe({
      next: (res: any) => {
        if (res.isSuccess) {
          row.isActive = !previousStatus;
          this.toast.success(res.message);
        } else {
          row.isActive = previousStatus;
          this.toast.error(res.message);
        }
      },
      error: () => {
        row.isActive = previousStatus;
        this.toast.error('Failed to update status');
      },
      complete: () => {
        row.isToggling = false;
      }
    });
  }


  onDelete(row: TemplateList): void {
    this.confirm
      .confirm('Are you sure you want to delete this template?')
      .subscribe(confirmed => {
        if (!confirmed) return;

        this.templateService.deleteTemplate(row.id).subscribe({
          next: (res: any) => {
            if (res.isSuccess) {
              this.toast.success(res.message);
              // refresh list after delete
              this.loadTemplates(this.pageIndex + 1, this.pageSize);
            } else {
              this.toast.error(res.message);
            }
          },
          error: () => {
            this.toast.error('Failed to delete template');
          }
        });
      });
  }


  private setColumns() {
    this.columns = ['Category', 'Type', 'Subject', 'Status'];
    this.columnFields = ['categoryName', 'type', 'subject', 'isActive'];
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
  }
}
