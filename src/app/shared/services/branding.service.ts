import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BrandingService {
  private readonly supplierBrandingSubject = new BehaviorSubject<boolean>(false);
  readonly supplierBranding$ = this.supplierBrandingSubject.asObservable();

  initialize(user?: unknown): void {
    this.applyBranding(user);
  }

  updateBranding(user?: unknown): void {
    this.applyBranding(user);
  }

  isSupplierBrandingActive(): boolean {
    return this.supplierBrandingSubject.value;
  }

  getAuthRoute(path: string): string {
    const normalizedPath = path.startsWith('/') ? path.slice(1) : path;

    return this.isSupplierBrandingActive()
      ? `/supplier/${normalizedPath}`
      : `/${normalizedPath}`;
  }

  private applyBranding(user?: unknown): void {
    const enabled = this.isSupplierAccessUrl() || this.isSupplierUser(user);

    this.supplierBrandingSubject.next(enabled);

    if (typeof document === 'undefined') {
      return;
    }

    document.documentElement.classList.toggle('supplier-branding', enabled);
    document.body.classList.toggle('supplier-branding', enabled);
  }

  private isSupplierAccessUrl(): boolean {
    if (typeof window === 'undefined') {
      return false;
    }

    const hostname = window.location.hostname.toLowerCase();
    const pathname = window.location.pathname.toLowerCase();
    const params = new URLSearchParams(window.location.search);
    const brand = (params.get('brand') || params.get('portal') || '').toLowerCase();

    return (
      brand === 'supplier' ||
      hostname.includes('supplier') ||
      hostname.includes('vendor') ||
      pathname.startsWith('/supplier')
    );
  }

  private isSupplierUser(user?: any): boolean {
    // Supplier status is determined solely by the backend:
    // AuthService sets supplierDetails on the login response when the user's role
    // has IsSupplier = true.  We rely on that flag exclusively — no roleType guessing.
    return !!user?.supplierDetails;
  }
}
