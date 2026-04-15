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

  goBack(): void {
    this.router.navigate(['/productbuild']);
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }
}
