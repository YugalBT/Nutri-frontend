import { Component, ElementRef, ViewChild, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { FeedService } from '../../../core/services/feed/feed.service';
import { ToastService } from '../../../shared/services/toast.service';
import { CommonService } from '../../../shared/services/common.service';
import { SharedModule } from '../../../shared/shared.module';
import { FarmList } from '../../../core/models/farm-list';
import { PERMISSIONS } from '../../../core/constants/permissions.constants';
import { CustomValidators } from '../../../core/helpers/validators';


declare var bootstrap: any;

@Component({
  selector: 'app-feed-add-edit',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './feed-add-edit.component.html',
  styleUrls: ['./feed-add-edit.component.css']
})
export class FeedAddEditComponent implements OnInit, OnDestroy {

  @ViewChild('feedModal') feedModal!: ElementRef;

  form!: FormGroup;
  modalInstance: any;

  isEdit = false;
  currentFeedId: string | null = null;

  farms: FarmList[] = [];
  farmsLoading = false;

  subs: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private toast: ToastService,
    private commonService: CommonService,
    private feedService: FeedService
  ) {}

  ngOnInit() {
    if(!this.commonService.checkPermission(PERMISSIONS.FeedAdd)
      || !this.commonService.checkPermission(PERMISSIONS.FeedEdit))
        return;
    this.initializeForm();
    this.loadFarmList();
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
  }


  private initializeForm() {
    this.form = this.fb.group({
      farmId: ['', Validators.required],
      feedName: ['', [Validators.required,Validators.min(3),Validators.max(20),Validators.pattern(/^(?=.*\p{L})[\p{L} _.'-]+$/u)]],
      category: ['', [Validators.required,Validators.min(3),Validators.max(20),Validators.pattern(/^(?=.*\p{L})[\p{L} _.'-]+$/u)]],
      dryMatter: [null,[Validators.required,CustomValidators.maxDigits(20),Validators.pattern(/^(?:0|[1-9]\d*)(?:\.\d+)?$/)]],
      protein: [null,[Validators.required,CustomValidators.maxDigits(20),Validators.pattern(/^(?:0|[1-9]\d*)(?:\.\d+)?$/)]],
      ndf: [null,[Validators.required,CustomValidators.maxDigits(20),Validators.pattern(/^(?:0|[1-9]\d*)(?:\.\d+)?$/)]],
      energy: [null,[Validators.required,CustomValidators.maxDigits(20),Validators.pattern(/^(?:0|[1-9]\d*)(?:\.\d+)?$/)]],
      pricePerKg: [null,[Validators.required,CustomValidators.maxDigits(20),Validators.pattern(/^(?:0|[1-9]\d*)(?:\.\d+)?$/)]],
      adf: [null, [Validators.required,CustomValidators.maxDigits(20),Validators.pattern(/^(?:0|[1-9]\d*)(?:\.\d+)?$/)]],
      fatContent: [null, [Validators.required,CustomValidators.maxDigits(20),Validators.pattern(/^(?:0|[1-9]\d*)(?:\.\d+)?$/)]],
      calcium: [null, [Validators.required,CustomValidators.maxDigits(20),Validators.pattern(/^(?:0|[1-9]\d*)(?:\.\d+)?$/)]],
      phosphorus: [null, [Validators.required,CustomValidators.maxDigits(20),Validators.pattern(/^(?:0|[1-9]\d*)(?:\.\d+)?$/)]],
      starch: [null,[Validators.required,CustomValidators.maxDigits(20),Validators.pattern(/^(?:0|[1-9]\d*)(?:\.\d+)?$/)]]
    });
  }

  private loadFarmList() {
    this.farmsLoading = true;

    const sub = this.commonService.getFarmsList().subscribe({
      next: res => {
        this.farms = Array.isArray(res?.data) ? res.data : [];
        this.farmsLoading = false;
      },
      error: () => {
        this.farmsLoading = false;
        this.farms = [];
        this.toast.error('Failed to load farms');
      }
    });

    this.subs.push(sub);
  }


  openModal(edit = false, data?: any) {
    this.isEdit = edit;
    this.form.reset();

    if (edit && data) {
      this.form.patchValue({
        clientId: data.clientId,
        farmId: data.farmId,
        feedName: data.feedName,
        category: data.category,

        dryMatter: data.dryMatter,
        protein: data.protein,
        ndf: data.ndf,
        energy: data.energy,
        pricePerKg: data.pricePerKg,

        adf: data.adf,
        fatContent: data.fatContent,
        calcium: data.calcium,
        phosphorus: data.phosphorus,
        starch : data.starch
      });

      this.currentFeedId = data.feedId;
    } else {
      this.currentFeedId = null;
    }

    this.modalInstance = new bootstrap.Modal(this.feedModal.nativeElement);
    this.modalInstance.show();
  }


  closeModal() {
    this.modalInstance?.hide();
  }

  saveFeed() {
    if (!this.form.valid) {
      this.toast.warning('Please fill all required fields');
      return;
    }

    const payload = this.form.value;


    if (this.isEdit && this.currentFeedId) {
      payload.feedId = this.currentFeedId;

      const sub = this.feedService.updateFeeds(payload).subscribe(res => {
        if (res.isSuccess) {
          this.toast.success(res.message);
          
          this.closeModal();
        } else {
          this.toast.error(res.message);
        }
      });

      this.subs.push(sub);
    }


    else {
      const sub = this.feedService.createFeeds(payload).subscribe(res => {
        if (res.isSuccess) {
          this.toast.success(res.message);
          this.closeModal();
        } else {
          this.toast.error(res.message);
        }
      });

      this.subs.push(sub);
    }
  }
}
