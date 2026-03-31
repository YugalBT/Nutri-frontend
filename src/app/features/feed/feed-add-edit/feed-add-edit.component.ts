import { Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { FeedService } from '../../../core/services/feed/feed.service';
import { ToastService } from '../../../shared/services/toast.service';
import { SharedModule } from '../../../shared/shared.module';
import { TranslatePipe } from '../../../i18n/translate.pipe';
import { CommonService } from '../../../shared/services/common.service';
import { PERMISSIONS } from '../../../core/constants/permissions.constants';

declare var bootstrap: any;

@Component({
  selector: 'app-feed-add-edit',
  standalone: true,
  imports: [SharedModule, TranslatePipe],
  templateUrl: './feed-add-edit.component.html',
  styleUrls: ['./feed-add-edit.component.css']
})
export class FeedAddEditComponent implements OnInit, OnDestroy {
  @ViewChild('feedModal') feedModal!: ElementRef;
  @Output() saved = new EventEmitter<void>();

  form!: FormGroup;
  modalInstance: any;

  isEdit = false;
  canSave = false;
  currentFeedId: string | null = null;

  categoryOptions = ['Foraggi', 'Concentrati', 'Robot', 'Minerali'];
  priceUnitOptions = [
    { value: 'ton', label: 'EUR / ton' },
    { value: 'quintal', label: 'EUR / quintal' },
    { value: 'kg', label: 'EUR / kg' }
  ];

  subs: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private toast: ToastService,
    private feedService: FeedService,
    private commonService: CommonService,
  ) {}

  ngOnInit() {
    this.initializeForm();
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
  }

  private initializeForm() {
    this.form = this.fb.group({
      farmId: [''],
      feedName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      category: ['', Validators.required],
      dryMatter: [null, [Validators.required, Validators.min(0), Validators.max(100)]],
      priceUnit: ['ton', Validators.required],
      price: [null, [Validators.required, Validators.min(0)]],
      vatApplicable: [false],
      pricePerKg: [null],
      protein: [null],
      ndf: [null],
      energy: [null],
      adf: [null],
      fatContent: [null],
      calcium: [null],
      phosphorus: [null],
      starch: [null]
    });

    this.form.get('price')?.valueChanges.subscribe(() => this.syncPricePerKg());
    this.form.get('priceUnit')?.valueChanges.subscribe(() => this.syncPricePerKg());
  }

  private syncPricePerKg() {
    const price = this.form.get('price')?.value;
    const unit = this.form.get('priceUnit')?.value;
    if (price == null) return;

    let perKg = price;
    if (unit === 'ton') perKg = price / 1000;
    if (unit === 'quintal') perKg = price / 100;

    this.form.patchValue({ pricePerKg: perKg }, { emitEvent: false });
  }

  openModal(edit = false, data?: any) {
    this.isEdit = edit;
    this.canSave = edit
      ? this.commonService.checkPermission(PERMISSIONS.FeedEdit, false)
      : this.commonService.checkPermission(PERMISSIONS.FeedAdd, false);
    if (!this.canSave) {
      this.toast.warning('No permission');
      return;
    }

    this.currentFeedId = null;
    this.form.reset({ vatApplicable: false, priceUnit: 'ton' });

    if (edit && data) {
      this.currentFeedId = data.feedId;

      const storedPerKg = data.pricePerKg ?? 0;
      const displayPrice = storedPerKg * 1000;

      this.form.patchValue({
        feedName: data.feedName,
        category: data.category,
        dryMatter: data.dryMatter,
        priceUnit: 'ton',
        price: displayPrice,
        vatApplicable: data.vatApplicable ?? false,
        pricePerKg: storedPerKg,
        protein: data.protein,
        ndf: data.ndf,
        energy: data.energy,
        adf: data.adf,
        fatContent: data.fatContent,
        calcium: data.calcium,
        phosphorus: data.phosphorus,
        starch: data.starch
      });
    }

    this.modalInstance = new bootstrap.Modal(this.feedModal.nativeElement, { backdrop: 'static' });
    this.modalInstance.show();
  }

  closeModal() {
    this.modalInstance?.hide();
  }

  saveFeed() {
    const hasPermission = this.isEdit
      ? this.commonService.checkPermission(PERMISSIONS.FeedEdit)
      : this.commonService.checkPermission(PERMISSIONS.FeedAdd);
    if (!hasPermission) return;

    if (!this.form.valid) {
      this.form.markAllAsTouched();
      this.toast.warning('Please fill all required fields');
      return;
    }

    this.syncPricePerKg();
    const payload: any = { ...this.form.getRawValue(), feedId: this.currentFeedId ?? undefined };

    const api$ = this.isEdit
      ? this.feedService.updateFeeds(payload)
      : this.feedService.createFeeds(payload);

    const sub = api$.subscribe(res => {
      if (res.isSuccess) {
        this.toast.success(res.message);
        this.saved.emit();
        this.closeModal();
      } else {
        this.toast.error(res.message);
      }
    });
    this.subs.push(sub);
  }
}
