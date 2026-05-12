import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterModule } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import { take } from 'rxjs/operators';
import { TranslatePipe } from '../../i18n/translate.pipe';
import { AuthService } from '../../core/auth/auth.service';
import { selectAuthUser } from '../../state/auth/auth.selectors';
import { SIDEBAR_GROUPS } from '../../core/constants/sidebar-groups';
import { SharedModule } from '../../shared/shared.module';

interface MenuItem {
  roleDisplayName?: string;
  roleDisplayNameIt?: string;
  roleName?: string;
  icon?: string;
  url?: string;
  safeIcon?: SafeHtml | string;
}

interface SidebarGroup {
  key: string;
  title: string;
  icon?: SafeHtml;
  items: MenuItem[];
}


const HIDDEN_MENU_NAMES = [
  'Placeholder',
  'Category Mapping',
  'Template Category',
  // 'Animal Group',
  // 'Ration',
  // 'Feed',
];
const TOP_MENU_NAMES = [
  'Companies',
  'Daily Entry'
];

// const COMPANY_MENU_ROUTE_MAP: Record<string, string> = {
//   'Company Data': '/farm',
//   Feeding: '/nutrition',
//   Rations: '/ration',
//   'Calf Barn': '/ration',
//   Feed: '/feed',
//   Archive: '/reports',
//   Technical: '/technicalReport',
//   Economic: '/economic-report',
//   Market: '/supplier-price',
//   Monthly: '/reports',
//   'Export Report': '/reports',
//   'Monthly / Annual / Quarterly': '/reports',
//   Settings: '/setting',
//   'User Profile': '/profile',
// };

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterModule, TranslatePipe, SharedModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent implements OnInit {
  groupedMenus: SidebarGroup[] = [];
  standaloneMenus: MenuItem[] = [];
  user: any = null;
  lang = 'en';
  topMenus: MenuItem[] = [];
  constructor(
    private sanitizer: DomSanitizer,
    private authService: AuthService,
    private store: Store,
  ) {}

  ngOnInit(): void {
    this.store
      .select(selectAuthUser)
      .pipe(take(1))
      .subscribe((authUser: any) => {
        this.user = authUser?.user || authUser;

        const roleType = (this.user?.roleType || '').toUpperCase();
        const companyMenu = Array.isArray(this.user?.companyMenu)
          ? this.user.companyMenu
          : [];

        // if (roleType && roleType !== 'ADMIN' && companyMenu.length > 0) {
        //   this.buildCompanyMenu(companyMenu);
        //   return;
        // }

        const menuSource = authUser?.menu || authUser?.data?.menu;
        if (Array.isArray(menuSource)) {
          const flatMenu = menuSource
            .filter((m: any) => !HIDDEN_MENU_NAMES.includes(m.roleDisplayName))
            .map((m: any) => ({
              ...m,
              url: m.url || m.link || m.path || m.route,
              safeIcon: m.icon ? this.sanitizeIcon(m.icon) : '',
            }));

          this.buildAccordionMenu(flatMenu);
        }
      });
  }

  get currentLang(): string {
    this.lang = localStorage.getItem('lang') || 'en';
    return this.lang;
  }

  getTranslatedKey(name?: string): string {
  if (!name) return '';

  const map: any = {
    'Companies': 'sidebarmenu.companies',
    'Daily Entry': 'sidebarmenu.dailyEntry'
  };

  return map[name] || name;
}
  // private buildCompanyMenu(companyMenu: string[]): void {
  //   const items: MenuItem[] = companyMenu
  //     .map((label) => ({
  //       roleDisplayName: label,
  //       url: COMPANY_MENU_ROUTE_MAP[label] || '/dashboard',
  //       safeIcon: '',
  //     }))
  //     .filter((item) => !!item.url);

  //   this.groupedMenus = [
  //     {
  //       key: 'company',
  //       title: 'Company',
  //       items,
  //     },
  //   ];
  //   this.standaloneMenus = [];
  // }

  // private buildAccordionMenu(flatMenu: MenuItem[]): void {
  //   const groupedItemNames = SIDEBAR_GROUPS.flatMap((group) => group.items);

  //   this.groupedMenus = SIDEBAR_GROUPS
  //     .map((group) => ({
  //       key: group.key,
  //       title: group.title,
  //       icon: group.icon
  //         ? this.sanitizer.bypassSecurityTrustHtml(group.icon)
  //         : undefined,
  //       items: flatMenu.filter((m) => group.items.includes(m.roleDisplayName || '')),
  //     }))
  //     .filter((group) => group.items.length > 0);

  //   this.standaloneMenus = flatMenu.filter(
  //     (m) =>
  //       !groupedItemNames.includes(m.roleDisplayName || '') &&
  //       m.roleDisplayName !==
  //         (this.currentLang === 'it' ? 'Pannello di controllo' : 'Dashboard'),
  //   );
  // }
private buildAccordionMenu(flatMenu: MenuItem[]): void {

  const roleType = (this.user?.roleType || '').toUpperCase();
  const isAdmin = roleType === 'ADMIN';

  // Check whether the current user has the SupplierPriceView permission.
  const hasSupplierPriceView = (this.user?.permissions as any[] ?? [])
    .some((p: any) => p.modulePermissionDisplay === 'SupplierPriceView');

  // Inject Deatech Raw Material Costs for Super Admin (ADMIN) only,
  // AND only when the user has the SupplierPriceView permission.
  // This is a frontend-only route not returned by the backend menu API.
  // Suppliers (CLIENT) use the /supplier-price route instead.
  if (isAdmin && hasSupplierPriceView) {
    const alreadyPresent = flatMenu.some(
      m => m.roleDisplayName === 'Deatech Raw Material Costs'
    );
    if (!alreadyPresent) {
      flatMenu = [
        ...flatMenu,
        {
          roleDisplayName: 'Deatech Raw Material Costs',
          roleDisplayNameIt: 'Costi Materie Prime Deatech',
          roleName: 'DeatechRawMaterialCosts',
          url: '/deatech-supplier-price',
          safeIcon: this.sanitizeIcon(
            `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"
              fill="none" stroke="#D2D2D2" stroke-width="1.8"
              stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 10L12 2H4v8l8 8a2 2 0 002.8 0l5.2-5.2a2 2 0 000-2.8z"/>
              <circle cx="7.5" cy="7.5" r="1.5"/>
              <path d="M14 14h4M16 12v4"/>
            </svg>`
          ),
        } as MenuItem,
      ];
    }
  }

  // Hide the supplier-facing "Raw Material Costs" page from admin sidebar.
  // Admins use "Deatech Raw Material Costs" (/deatech-supplier-price) instead.
  if (isAdmin) {
    flatMenu = flatMenu.filter(m => m.roleDisplayName !== 'Raw Material Costs');
  }

  const groupedItemNames = SIDEBAR_GROUPS.flatMap(group => group.items);

  this.topMenus = flatMenu.filter(m =>
    TOP_MENU_NAMES.includes(m.roleDisplayName || '')
  );

  // ✅ Remove TOP from further processing
  const filteredMenu = flatMenu.filter(m =>
    !TOP_MENU_NAMES.includes(m.roleDisplayName || '')
  );

  // ✅ GROUPS (UNCHANGED)
  this.groupedMenus = SIDEBAR_GROUPS.map(group => {

    const orderedItems: MenuItem[] = [];

    group.items.forEach(itemName => {
      const found = filteredMenu.find(
        m => (m.roleDisplayName || '') === itemName
      );

      if (found) {
        orderedItems.push(found);
      }
    });

    return {
      key: group.key,
      title: group.title,
      icon: group.icon
        ? this.sanitizer.bypassSecurityTrustHtml(group.icon)
        : undefined,
      items: orderedItems
    };

  }).filter(group => group.items.length > 0);

  this.standaloneMenus = filteredMenu.filter(m =>
    !groupedItemNames.includes(m.roleDisplayName || '') &&
    m.roleDisplayName !==
    (this.currentLang === 'it'
      ? 'Pannello di controllo'
      : 'Dashboard')
  );
}

  logout(): void {
    this.authService.logout();
  }

  private sanitizeIcon(icon: string): SafeHtml {
    const cleaned = icon
      .replace(/<\/?li[^>]*>/gi, '')
      .replace(/\\n/g, '')
      .replace(/\\t/g, '')
      .replace(/\\"/g, '"')
      .trim();

    return this.sanitizer.bypassSecurityTrustHtml(cleaned);
  }
}

