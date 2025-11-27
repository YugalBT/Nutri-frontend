import { Component, OnInit } from '@angular/core';
import { DashboardComponent } from '../../features/dashboard/dashboard.component';
import { HeaderComponent } from "../header/header.component";
import { Router, RouterLink, RouterModule } from "@angular/router";
import { NgFor, NgIf, LowerCasePipe } from '@angular/common';
import { ConfirmDialogService } from '../../shared/services/confirm-dialog.service';
import { ToastService } from '../../shared/services/toast.service';
import { TranslateService } from '../../i18n/translate.service';
import { TranslatePipe } from '../../i18n/translate.pipe';
import { Constants } from '../../shared/utils/constants/constants';
import { TokenService } from '../../shared/services/token.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import { selectAuthUser } from '../../state/auth/auth.selectors';
import { take } from 'rxjs/operators';

interface MenuItem {
  roleDisplayName?: string;
  roleName?: string;
  icon?: string;
  url?: string;
  safeIcon?: SafeHtml;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, TranslatePipe, NgFor, NgIf, LowerCasePipe,RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {

  menuItems: MenuItem[] = [];
  user: any = null;

  constructor(
    private router: Router,
    private confirm: ConfirmDialogService,
    private toast: ToastService,
    private translate: TranslateService,
    private tokenService: TokenService,
    private sanitizer: DomSanitizer,
    private store: Store
  ) {}

  openProfile(event: Event) {
    event.stopPropagation();
    this.router.navigate(['/profile']);
  }

  ngOnInit(): void {
    // Prefer NgRx auth user if available
    this.store.select(selectAuthUser).pipe(take(1)).subscribe((authUser: any) => {
      if (authUser) {
        // populate menu
        if (authUser.menu && Array.isArray(authUser.menu)) {
          this.menuItems = authUser.menu.map((m: any) => ({
            ...m,
            url: m.url || m.link || m.path || m.route,
            safeIcon: m?.icon ? this.sanitizeIcon(m.icon) : ''
          }));
        }
        // populate user info
        this.user = {
          logo: authUser.logo || authUser.data?.logo || authUser?.user?.logo,
          firstName: authUser.firstName || authUser.data?.firstName || authUser?.user?.firstName,
          lastName: authUser.lastName || authUser.data?.lastName || authUser?.user?.lastName,
          roles: authUser.roles || authUser.data?.roles || authUser?.user?.roles,
          email: authUser.email || authUser.data?.email || authUser?.user?.email
        };
        return;
      }

      // Fallback to localStorage-stored user data
      const data = this.tokenService.getUserData();
      if (data) {
        try {
          const parsed = JSON.parse(data);
          const menu = parsed?.data?.menu || parsed?.menu || [];
          if (Array.isArray(menu)) {
            this.menuItems = menu.map((m: any) => ({
              ...m,
              url: m.url || m.link || m.path || m.route,
              safeIcon: m?.icon ? this.sanitizeIcon(m.icon) : ''
            }));
          }
          // try to populate user from parsed data
          const u = parsed?.data || parsed;
          this.user = {
            logo: u?.logo,
            firstName: u?.firstName,
            lastName: u?.lastName,
            roles: u?.roles
          };
        } catch (e) {
          // ignore parse errors
        }
      }
    });
  }

  private stripListTags(html: string): string {
    if (!html) return html;
    // remove any stray <li> or </li> tags that may be present inside icon HTML
    return html.replace(/<\/?li[^>]*>/gi, '');
  }

  private sanitizeIcon(icon: string): SafeHtml {
    if (!icon) return '';

    // decode any HTML entities (e.g. &lt;svg&gt;) by parsing as HTML
    let decoded = icon;
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(icon, 'text/html');
      const txt = doc.documentElement.textContent;
      if (txt && txt.trim().length) decoded = txt;
    } catch (e) {
      // ignore if DOMParser not available or parsing fails
    }

    const cleaned = decoded
      .replace(/<\/?li[^>]*>/gi, '')  // remove <li> or </li>
      .replace(/\\n/g, '')           // remove \n
      .replace(/\\t/g, '')           // remove \t
      .replace(/\\"/g, '"')        // unescape quotes
      .replace(/\s{2,}/g, ' ')       // collapse big spaces
      .trim();

    return this.sanitizer.bypassSecurityTrustHtml(cleaned);
  }


  logout() {
    this.confirm.confirm(this.translate.instant('sidebar.confirmLogout') || 'Do you really want to logout?').subscribe(result => {
      if (result) {
        localStorage.clear();
        this.toast.success(this.translate.instant('sidebar.logoutSuccess') || Constants.LOGOUT_SUCCESS);
        this.router.navigate(['/login']);
      }
    });
  }
}
