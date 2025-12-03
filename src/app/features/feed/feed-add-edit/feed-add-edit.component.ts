import { Component, ElementRef, ViewChild, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { FeedService } from '../../../core/services/feed/feed.service';
import { ToastService } from '../../../shared/services/toast.service';
import { CommonService } from '../../../shared/services/common.service';
import { SharedModule } from '../../../shared/shared.module';
import { TranslatePipe } from '../../../i18n/translate.pipe';

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
  subs: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private toast: ToastService,
    private commonService: CommonService,
    private feedService :FeedService
  ) {}

  ngOnInit() {
    this.initializeForm();
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
  }

  private initializeForm() {
    this.form = this.fb.group({
      feedName: ['', Validators.required],
      category: ['', Validators.required],
      dryMatter: [null],
      protein: [null],
      ndf: [null],
      energy: [null],
      pricePerKg: [null],
    });
  }

  openModal(edit = false, data?: any) {
    this.isEdit = edit;
    this.form.reset();

    if (edit && data) {
      this.form.patchValue({
        feedName: data.feedName,
        category: data.category,
        dryMatter: data.dryMatter,
        protein: data.protein,
        ndf: data.ndf,
        energy: data.energy,
        pricePerKg: data.pricePerKg,
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
    } else {
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
