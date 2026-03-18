// import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
// import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { Subscription } from 'rxjs';
// import { ToastService } from '../../../shared/services/toast.service';
// import { CommonService } from '../../../shared/services/common.service';
// import { CalvesService } from '../../../core/services/calves/calves.service';
// import { ApiResponse } from '../../../core/models/api-response';
// import { FeedList } from '../../../core/models/feed-list';
// import { SharedModule } from '../../../shared/shared.module';
// import { PERMISSIONS } from '../../../core/constants/permissions.constants';
// import { CustomValidators } from '../../../core/helpers/validators';

// declare var bootstrap: any;

// @Component({
//   selector: 'app-calves-add-edit',
//   standalone: true,
//   imports: [SharedModule],
//   templateUrl: './calves-add-edit.component.html',
//   styleUrls: ['./calves-add-edit.component.css']
// })
// export class CalvesAddEditComponent implements OnInit, OnDestroy {

//   @ViewChild('calvesModal') calvesModal!: ElementRef;

//   form!: FormGroup;
//   modalInstance: any;

//   isEdit = false;
//   currentCalvesId: string | null = null;

//   feeds: FeedList[] = [];
//   // days: DayList[] = [];

//   feedsLoading = false;
//   daysLoading = false;

//   subs: Subscription[] = [];

//   constructor(
//     private fb: FormBuilder,
//     private toast: ToastService,
//     private commonService: CommonService,
//     private calvesService: CalvesService,
//   ) {}

//   ngOnInit() {
//     if(!this.commonService.checkPermission(PERMISSIONS.CalvesRationAdd)|| !this.commonService.checkPermission(PERMISSIONS.CalvesRationEdit))
//       return;
//     this.initForm();
//     this.loadFeeds();
//     this.loadDays();
//   }

//   ngOnDestroy() {
//     this.subs.forEach(x => x.unsubscribe());
//   }

//   /** FORM **/
//   private initForm() {
//     this.form = this.fb.group({
//       dayId: ['', Validators.required],
//       ageClass: ['', Validators.required],
//       feedId: ['', Validators.required],
//       kgPerHeadPerDay: ['',CustomValidators.maxDigits(20), Validators.required],
//       costPerHeadPerDay: ['',CustomValidators.maxDigits(20), Validators.required]
//     });
//   }

//   /** LOAD FEEDS **/
//   private loadFeeds() {
//     this.feedsLoading = true;

//     const sub = this.commonService.getFeedList().subscribe({
//       next: (res: ApiResponse<any>) => {
//         this.feeds = Array.isArray(res.data) ? res.data : [];
//         this.feedsLoading = false;
//       },
//       error: (err) => {
//         this.feedsLoading = false;
//         this.feeds = [];
//         this.toast.error(err.message);
//       }
//     });

//     this.subs.push(sub);
//   }

//   /** LOAD DAYS **/
//   private loadDays() {
//     this.daysLoading = true;

//     const sub = this.commonService.getDayList().subscribe({
//       next: (res: ApiResponse<any>) => {
//         this.days = Array.isArray(res.data) ? res.data : [];
//         this.daysLoading = false;
//       },
//       error: (err) => {
//         this.daysLoading = false;
//         this.days = [];
//         this.toast.error(err.message);
//       }
//     });

//     this.subs.push(sub);
//   }

//   /** OPEN MODAL **/
//   openModal(edit = false, data?: any) {
//     this.isEdit = edit;
//     this.form.reset();

//     if (edit && data) {
//       this.form.patchValue({
//         dayId: data.dayId,
//         ageClass: data.ageClass,
//         feedId: data.feedId,
//         kgPerHeadPerDay: data.kgPerHeadPerDay,
//         costPerHeadPerDay: data.costPerHeadPerDay,
//       });

//       this.currentCalvesId = data.calvesId;
//     } else {
//       this.currentCalvesId = null;
//     }

//     this.modalInstance = new bootstrap.Modal(this.calvesModal.nativeElement);
//     this.modalInstance.show();
//   }

//   closeModal() {
//     this.modalInstance?.hide();
//   }

//   /** SAVE **/
//   saveCalves() {

    
//     if(!this.commonService.checkPermission(PERMISSIONS.CalvesRationAdd)|| !this.commonService.checkPermission(PERMISSIONS.CalvesRationEdit))
//       return;
//     if (this.form.invalid) {
//       this.toast.warning('Please fill all required fields.');
//       return;
//     }

//     const payload = { ...this.form.value };

//     if (this.isEdit && this.currentCalvesId) {
//       payload.calvesId = this.currentCalvesId;

//       const sub = this.calvesService.updateCalves(payload).subscribe(res => {
//         res.isSuccess ? this.toast.success(res.message) : this.toast.error(res.message);
//         this.closeModal();
//       });

//       this.subs.push(sub);
//     } else {
//       const sub = this.calvesService.createCalves(payload).subscribe(res => {
//         res.isSuccess ? this.toast.success(res.message) : this.toast.error(res.message);
//         this.closeModal();
//       });

//       this.subs.push(sub);
//     }
//   }

// }
