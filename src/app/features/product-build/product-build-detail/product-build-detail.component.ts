import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductBuildService } from '../../../core/services/product-build-service/product-build-service';
import { TokenService } from '../../../shared/services/token.service';
import { ToastService } from '../../../shared/services/toast.service';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { TranslatePipe } from '../../../i18n/translate.pipe';

@Component({
  selector: 'app-product-build-detail',
  standalone: true,
  imports: [CommonModule,TranslatePipe],
  templateUrl: './product-build-detail.component.html',
  styleUrls: ['./product-build-detail.component.css']
})
export class ProductBuildDetailComponent implements OnInit, OnDestroy {

  build: any = null;
  appliedCharges: Array<{ key: string; label: string; value: any }> = [];
  loading = true;
  isSupplier = false;
  private subs: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: ProductBuildService,
    private tokenService: TokenService,
    private toast: ToastService
  ) {}

 ngOnInit(): void {
  this.isSupplier = !!this.tokenService.isSupplier();

  const id = this.route.snapshot.paramMap.get('id');
  const navData = window.history.state?.build;

  // Show quick data (optional)
  if (navData) {
    this.build = navData;
    this.appliedCharges = this.normalizeAppliedCharges(navData?.costBreakdown?.appliedCharges);
  }

  // ✅ ALWAYS load full detail
  if (id) {
    this.loadBuildDetail(id);
  } else {
    this.toast.error('Invalid ID');
    this.goBack();
  }
}

  private loadBuildDetail(id: string): void {
    const sub = this.service.getById(id).subscribe({
      next: (res: any) => {
        if (res.isSuccess && res.data) {
          this.build = res.data;
          this.appliedCharges = this.normalizeAppliedCharges(res.data?.costBreakdown?.appliedCharges);
          this.loading = false;
        } else {
          this.toast.error(res.message || 'Failed to load product build details');
          this.goBack();
        }
      },
      error: (err) => {
        this.toast.error(err?.error?.message || 'Error loading product build');
        this.goBack();
      }
    });

    this.subs.push(sub);
  }

  getTotalAmount(): number {
    if (!this.build?.items) return 0;
    return this.build.items.reduce((sum: number, x: any) =>
      sum + (x.calculatedCost || 0), 0);
  }

  getTotalPercentage(): number {
    if (!this.build?.items) return 0;
    return this.build.items.reduce((sum: number, x: any) =>
      sum + (x.percentage || 0), 0);
  }

  getCostBreakdown(): any {
    return this.build?.costBreakdown || {};
  }

  private normalizeAppliedCharges(charges: any): Array<{ key: string; label: string; value: any }> {

    if (!charges) return [];

    if (Array.isArray(charges)) {
      return charges
        .filter((item: any) => item)
        .map((item: any) => ({
          key: item.key ?? item.name ?? item.label ?? '',
          label: item.label ?? item.name ?? item.key ?? 'Charge',
          value: item.value ?? item.amount ?? item.cost ?? item
        }));
    }

    if (typeof charges === 'object') {
      return Object.entries(charges).map(([key, value]) => ({
        key,
        label: key,
        value
      }));
    }

    return [];
  }

  getFormulaName(): string {
    return this.getCostBreakdown()?.formulaName || this.build?.formulaName || 'N/A';
  }

  getFormulaExpression(): string {
    return this.getCostBreakdown()?.formulaExpression || this.build?.formulaExpression || '-';
  }

  getFinalCost(): number {
    const breakdownFinal = this.getCostBreakdown()?.finalCost;
    const buildFinal = this.build?.finalCost ?? this.build?.totalCost;
    return Number(breakdownFinal ?? buildFinal ?? 0) || 0;
  }

  formatChargeValue(value: any): string {
    if (value === null || value === undefined || value === '') return '-';
    if (typeof value === 'number') return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (!Number.isNaN(Number(value))) {
      return Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return String(value);
  }

  goBack(): void {
    this.router.navigate(['/productbuild']);
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }
}
