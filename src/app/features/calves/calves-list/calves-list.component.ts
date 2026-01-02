// import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
// import { Subscription } from 'rxjs';
// import { SharedModule } from '../../../shared/shared.module';
// import { ReusableTableComponent } from '../../../shared/components/reusable-table/reusable-table.component';
// import { GlobalSearchComponent } from '../../../shared/components/global-search/global-search.component';
// import { CalvesAddEditComponent } from '../calves-add-edit/calves-add-edit.component';
// import { CalvesService } from '../../../core/services/calves/calves.service';
// import { ToastService } from '../../../shared/services/toast.service';
// import { ConfirmDialogService } from '../../../shared/services/confirm-dialog.service';
// import { ApiResponse } from '../../../core/models/api-response';
// import { CommonService } from '../../../shared/services/common.service';
// import { PERMISSIONS } from '../../../core/constants/permissions.constants';

// @Component({
//   selector: 'app-calves-list',
//   standalone: true,
//   imports: [
//     SharedModule,
//     ReusableTableComponent,
//     GlobalSearchComponent,
//     CalvesAddEditComponent
//   ],
//   templateUrl: './calves-list.component.html',
//   styleUrls: ['./calves-list.component.css']
// })
// export class CalvesListComponent implements OnInit, OnDestroy {

//   @ViewChild('calvesModal') calvesModal!: CalvesAddEditComponent;

//   columns: string[] = [];
//   columnFields: string[] = [];

//   calves: any[] = [];
//   totalRecords = 0;
//   pageSize = 5;
//   pageIndex = 0;

//   searchValue = '';
//   filterStatus: number | null = 2;

//   subs: Subscription[] = [];

//   constructor(
//     private calvesService: CalvesService,
//     private toast: ToastService,
//     private confirm: ConfirmDialogService,
//     private commonService : CommonService
//   ) {
//     this.setColumns();
//   }

//   ngOnInit(): void {

    
//     if(!this.commonService.checkPermission(PERMISSIONS.CalvesRationView))
//       return;
//     this.loadCalves(1, this.pageSize);

//     const sub = this.calvesService.calvesChanged$.subscribe(() => {
//       this.loadCalves(this.pageIndex + 1, this.pageSize);
//     });
//     this.subs.push(sub);
//   }

//   private loadCalves(pageNo: number, recordPerPage: number): void {
//     const payload = {
//       pageNo,
//       recordPerPage,
//       searchValue: this.searchValue ?? '',
//       status: this.filterStatus
//     };

//     const sub = this.calvesService.getCalveDetails(payload).subscribe({
//       next: (res: ApiResponse<any>) => {
//         this.calves = res?.data ?? [];
//         this.totalRecords = res?.totalRecords ?? 0;
//       },
//       error: () => {
//         this.calves = [];
//       }
//     });

//     this.subs.push(sub);
//   }

//   onSearch(value: string): void {
//     this.searchValue = value;
//     this.pageIndex = 0;
//     this.loadCalves(1, this.pageSize);
//   }

//   onStatusChange(status: number | null): void {
//     this.filterStatus = status ?? 2;
//     this.pageIndex = 0;
//     this.loadCalves(1, this.pageSize);
//   }

//   clearFilters(): void {
//     this.searchValue = '';
//     this.filterStatus = 2;
//     this.pageIndex = 0;
//     this.loadCalves(1, this.pageSize);
//   }

//   onPageChange(event: { pageIndex: number; pageSize: number }): void {
//     this.pageIndex = event.pageIndex;
//     this.pageSize = event.pageSize;
//     this.loadCalves(this.pageIndex + 1, this.pageSize);
//   }

//   onToggleActive(event: { row: any; isActive: boolean }): void {
//     event.row.isToggling = true;

//     const id = event?.row?.calvesId;
//     if (!id) {
//       this.toast.error("Invalid calves id");
//       return;
//     }

//     const sub = this.calvesService.activeInActive(id).subscribe({
//       next: (res: ApiResponse<any>) => {
//         res.isSuccess
//           ? this.toast.success(res.message)
//           : this.toast.error(res.message);

//         if (res.isSuccess) {
//           event.row.isActive = !event.row.isActive;
//         }
//       },
//       complete: () => (event.row.isToggling = false)
//     });

//     this.subs.push(sub);
//   }

//   onDelete(row: any): void {
//     if(!this.commonService.checkPermission(PERMISSIONS.CalvesRationDelete))
//       return;
//     const id = row?.calvesId;
//     if (!id) {
//       this.toast.error("Invalid calves id");
//       return;
//     }

//     this.confirm.confirm("Are you sure you want to delete this record?")
//       .subscribe((confirmed) => {
//         if (!confirmed) return;

//         const sub = this.calvesService.deleteCalves(id).subscribe({
//           next: (res: ApiResponse<any>) => {
//             res.isSuccess ? this.toast.success(res.message) : this.toast.error(res.message);
//             this.calvesService.notifycalvesChanged();
//           }
//         });

//         this.subs.push(sub);
//       });
//   }

//   private setColumns(): void {
//     this.columns = [
//       'Day',
//       'Age Class',
//       'Feed Name',
//       'Kg/Head/Day',
//       'Cost/Head/Day',
//       'Status'
//     ];

//     this.columnFields = [
//       'date',
//       'ageClass',
//       'feedName',
//       'kgPerHeadPerDay',
//       'costPerHeadPerDay',
//       'isActive'
//     ];
//   }

//   ngOnDestroy(): void {
//     this.subs.forEach(s => s.unsubscribe());
//   }
// }
