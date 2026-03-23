import { Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { take } from 'rxjs/operators';
import { FeedService } from '../../../core/services/feed/feed.service';
import { ToastService } from '../../../shared/services/toast.service';
import { CommonService } from '../../../shared/services/common.service';
import { SharedModule } from '../../../shared/shared.module';
import { FarmList } from '../../../core/models/farm-list';
import { PERMISSIONS } from '../../../core/constants/permissions.constants';
import { TranslatePipe } from '../../../i18n/translate.pipe';
import { selectAuthUser } from '../../../state/auth/auth.selectors';

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
  currentFeedId: string | null = null;

  // Farm selector — only shown for ADMIN / SUPERADMIN
  farms: FarmList[] = [];
  farmsLoading = false;
  isAdminUser = false;   // controls whether farm dropdown is visible
  autoFarmId: string | null = null; // used when company user has exactly one farm

  // Mattia's 5 categories (Req #4)
  categoryOptions = ['Foraggi', 'Concentrati', 'Robot', 'Minerali'];
  priceUnitOptions = [
    { value: 'ton',     label: '€ / ton' },
    { value: 'quintal', label: '€ / quintal' },
    { value: 'kg',      label: '€ / kg' }
  ];

  subs: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private toast: ToastService,
    private commonService: CommonService,
    private feedService: FeedService,
    private store: Store
  ) {}

  ngOnInit() {
    this.initializeForm();
    this.resolveUserRole();
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
  }

  // ── determine role then load farms accordingly ─────────────
  private resolveUserRole() {
    const sub = this.store.select(selectAuthUser).pipe(take(1)).subscribe(user => {
      // ADMIN or SUPERADMIN sees the farm dropdown
      const roleType = (user?.roleType ?? '').toUpperCase();
      this.isAdminUser = roleType === 'ADMIN' || user?.isSuperAdmin === true;
      this.loadFarmList();
    });
    this.subs.push(sub);
  }

  private initializeForm() {
    this.form = this.fb.group({
      farmId:     ['', Validators.required],
      feedName:   ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      // Mattia's 5 fields (Req #4)
      category:   ['', Validators.required],
      dryMatter:  [null, [Validators.required, Validators.min(0), Validators.max(100)]],
      priceUnit:  ['ton', Validators.required],   // ton / quintal / kg
      price:      [null, [Validators.required, Validators.min(0)]],
      vatApplicable: [false],
      // hidden from UI but kept for DB compatibility
      pricePerKg: [null],
      protein:    [null],
      ndf:        [null],
      energy:     [null],
      adf:        [null],
      fatContent: [null],
      calcium:    [null],
      phosphorus: [null],
      starch:     [null]
    });

    // auto-convert displayed price → pricePerKg on save
    this.form.get('price')?.valueChanges.subscribe(() => this.syncPricePerKg());
    this.form.get('priceUnit')?.valueChanges.subscribe(() => this.syncPricePerKg());
  }

  // Convert displayed price to €/kg for storage
  private syncPricePerKg() {
    const price = this.form.get('price')?.value;
    const unit  = this.form.get('priceUnit')?.value;
    if (price == null) return;
    let perKg = price;
    if (unit === 'ton')     perKg = price / 1000;
    if (unit === 'quintal') perKg = price / 100;
    this.form.patchValue({ pricePerKg: perKg }, { emitEvent: false });
  }

  private loadFarmList() {
    this.farmsLoading = true;
    const sub = this.commonService.getFarmsList().subscribe({
      next: res => {
        this.farms = Array.isArray(res?.data) ? res.data : [];
        this.farmsLoading = false;

        // Company user: auto-set farmId to their only farm, no dropdown shown
        if (!this.isAdminUser && this.farms.length > 0) {
          this.autoFarmId = String(this.farms[0].farmId);
          this.form.patchValue({ farmId: this.autoFarmId });
          this.form.get('farmId')?.disable();
        }
      },
      error: () => {
        this.farmsLoading = false;
        this.toast.error('Failed to load farms');
      }
    });
    this.subs.push(sub);
  }

  openModal(edit = false, data?: any) {
    this.isEdit = edit;
    this.currentFeedId = null;
    this.form.reset({ vatApplicable: false, priceUnit: 'ton' });

    if (edit && data) {
      this.currentFeedId = data.feedId;

      // Convert stored pricePerKg → display price in ton
      const storedPerKg = data.pricePerKg ?? 0;
      const displayPrice = storedPerKg * 1000; // default show as €/ton

      this.form.patchValue({
        farmId:       data.farmId,
        feedName:     data.feedName,
        category:     data.category,
        dryMatter:    data.dryMatter,
        priceUnit:    'ton',
        price:        displayPrice,
        vatApplicable: data.vatApplicable ?? false,
        pricePerKg:   storedPerKg,
        protein:      data.protein,
        ndf:          data.ndf,
        energy:       data.energy,
        adf:          data.adf,
        fatContent:   data.fatContent,
        calcium:      data.calcium,
        phosphorus:   data.phosphorus,
        starch:       data.starch
      });
      this.form.get('farmId')?.disable();
    } else {
      // Add mode: re-apply farm scope for company users
      if (this.autoFarmId) {
        this.form.patchValue({ farmId: this.autoFarmId });
        this.form.get('farmId')?.disable();
      }
    }

    this.modalInstance = new bootstrap.Modal(this.feedModal.nativeElement, { backdrop: 'static' });
    this.modalInstance.show();
  }

  closeModal() {
    this.modalInstance?.hide();
  }

  saveFeed() {
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