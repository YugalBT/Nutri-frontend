import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { API_ENDPOINTS } from '../../core/constants/api-endpoints';
import { TranslatePipe } from '../../i18n/translate.pipe';
import { TranslateService } from '../../i18n/translate.service';
import { HttpService } from '../../shared/services/http.service';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-milk-price-history',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './milk-price-history.component.html'
})
export class MilkPriceHistoryComponent implements OnInit, OnDestroy {
  @Input() farmId!: string;

  history: any[] = [];
  form!: FormGroup;
  isLoading = false;
  isSaving = false;
  private subs: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    private toast: ToastService,
    private translate: TranslateService
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.load();
  }

  initForm(): void {
    const now = new Date();
    const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    this.form = this.fb.group({
      priceMonth: [thisMonth, Validators.required],
      priceAziendali: [null, [Validators.required, Validators.min(0)]],
      priceMercato: [null],
      qualityBonus: [null],
      isFinalized: [false],
      notes: [null]
    });
  }

  load(): void {
    if (!this.farmId) return;
    this.isLoading = true;
    const sub = this.http.get<any>(`${API_ENDPOINTS.MILK_PRICE_HISTORY.GET_BY_FARM}/${this.farmId}`)
      .subscribe({
        next: (res) => {
          this.history = res?.data ?? [];
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        }
      });
    this.subs.push(sub);
  }

  loadMonthIntoForm(entry: any): void {
    this.form.patchValue({
      priceMonth: entry.priceMonth,
      priceAziendali: entry.priceAziendali,
      priceMercato: entry.priceMercato,
      qualityBonus: entry.qualityBonus,
      isFinalized: entry.isFinalized,
      notes: entry.notes
    });
  }

  save(): void {
    if (this.form.invalid || this.isSaving) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    const payload = { ...this.form.value, farmId: this.farmId };

    const sub = this.http.post<any>(API_ENDPOINTS.MILK_PRICE_HISTORY.SAVE, payload).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.toast.success(res.message);
          this.load();
        } else {
          this.toast.error(res.message);
        }
        this.isSaving = false;
      },
      error: () => {
        this.toast.error(this.translate.instant('milkPriceHistory.messages.saveError'));
        this.isSaving = false;
      }
    });
    this.subs.push(sub);
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }
}
