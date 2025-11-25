import { Directive, Input, TemplateRef, ViewContainerRef, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { selectUserRoles } from '../state/auth/auth.selectors';

@Directive({
  selector: '[appHasPermission]',
  standalone: true
})
export class HasPermissionDirective implements OnDestroy {
  private permsSub: Subscription | null = null;


  @Input('appHasPermission') permissions!: string | string[];

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private store: Store
  ) {}

  ngOnChanges?(): void {
    // handled in setter below via subscription
  }

  @Input()
  set appHasPermission(value: string | string[]) {
    this.permissions = value;
    this.updateView();
  }

  private updateView() {
    // unsubscribe previous
    if (this.permsSub) {
      this.permsSub.unsubscribe();
      this.permsSub = null;
    }

    this.permsSub = this.store.select(selectUserRoles).subscribe((roles: string[]) => {
      const required = Array.isArray(this.permissions) ? this.permissions : [this.permissions];
      const has = required.some(r => roles && roles.includes(r));
      this.viewContainer.clear();
      if (has) {
        this.viewContainer.createEmbeddedView(this.templateRef);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.permsSub) {
      this.permsSub.unsubscribe();
      this.permsSub = null;
    }
  }
}
