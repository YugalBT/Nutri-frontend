import {
  Component, OnInit, OnDestroy, ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ReusableTableComponent } from '../../../shared/components/reusable-table/reusable-table.component';
import { GlobalSearchComponent } from '../../../shared/components/global-search/global-search.component';
import { ModuleAddEditComponent } from '../module-add-edit/module-add-edit.component';
import { ToastService } from '../../../shared/services/toast.service';
import { ConfirmDialogService } from '../../../shared/services/confirm-dialog.service';
import { ModuleList } from '../../../core/models/module-list';
import { ApiResponse } from '../../../core/models/api-response';
import { ModuleListService } from '../../../core/services/module/module-list.service';
import { CommonService } from '../../../shared/services/common.service';
import { PERMISSIONS } from '../../../core/constants/permissions.constants';

@Component({
  selector: 'app-module-list',
  standalone: true,
  imports: [
    CommonModule,
    ReusableTableComponent,
    GlobalSearchComponent,
    ModuleAddEditComponent
  ],
  templateUrl: './module-list.component.html',
  styleUrls: ['./module-list.component.css']
})
export class ModuleListComponent implements OnInit, OnDestroy {

  @ViewChild(ModuleAddEditComponent) moduleAddEdit!: ModuleAddEditComponent;

  modules: ModuleList[] = [];
  modulesLoading = false;

  columns: string[] = ['Module Name', 'Display Name', 'Permissions'];
  columnFields: string[] = ['moduleName', 'moduleDisplayName','permissionsText'];

  totalRecords = 0;
  pageSize = 10;
  pageIndex = 0;

  searchValue = '';
  subs: Subscription[] = [];

  constructor(
    private moduleService: ModuleListService,
    private confirm: ConfirmDialogService,
    private toast: ToastService,
    private commonService : CommonService
  ) { }

  ngOnInit(): void {
    if(!this.commonService.checkPermission(PERMISSIONS.ModuleView)
      || !this.commonService.checkPermission(PERMISSIONS.ModuleDelete))
        return;
    this.loadModules();
  }

 loadModules() {
  this.modulesLoading = true;

  const sub = this.moduleService.getModules(true).subscribe({
    next: (res: ApiResponse<any>) => {
      let list = res.data ?? [];

      // Search filter
      if (this.searchValue.trim() !== '') {
        const s = this.searchValue.toLowerCase();
        list = list.filter((x: any) =>
          x.moduleName.toLowerCase().includes(s) ||
          x.moduleDisplayName.toLowerCase().includes(s)
        );
      }

      this.modules = list.map((m: any) => {
        return {
          ...m,
          permissionsText: m.permissions?.length
            ? m.permissions.map((p: any) => p.modulePermissionDisplay).join(', ')
            : '-'
        };
      });

      this.totalRecords = list.length;
      this.modulesLoading = false;
    },
    error: (error: ApiResponse<any>) => {
      this.modulesLoading = false;
      this.toast.error(error.message);
    }
  });

  this.subs.push(sub);
}



  onSearch(text: string) {
    this.searchValue = text;
    this.loadModules();
  }

  openAdd() {
    this.moduleAddEdit.openModal(false);
  }

  openEdit(row: ModuleList) {
    this.moduleAddEdit.openModal(true, row);
  }

  onDeleteModule(row: ModuleList) {

    if(!this.commonService.checkPermission(PERMISSIONS.ModuleDelete))
        return;
    this.confirm.confirm("Are you sure you want to delete this module?")
      .subscribe((ok) => {
        if (!ok) return;

        const sub = this.moduleService.deleteModule(row.moduleId).subscribe({
          next: (res: ApiResponse<any>) => {
            if(res.isSuccess)
            {
            this.toast.success(res.message);
            this.loadModules();
            }else{
              this.toast.success(res.message);
            }
            
          },
          error: (err: ApiResponse<any>) => {
            this.toast.error(err?.message);
          }
        });

        this.subs.push(sub);
      });
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
  }
}
