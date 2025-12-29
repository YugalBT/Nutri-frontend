import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { NgFor, NgIf, LowerCasePipe } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import { take } from 'rxjs/operators';

import { TranslatePipe } from '../../i18n/translate.pipe';
import { TokenService } from '../../shared/services/token.service';
import { AuthService } from '../../core/auth/auth.service';
import { selectAuthUser } from '../../state/auth/auth.selectors';
import { SIDEBAR_GROUPS } from '../../core/constants/sidebar-groups';


interface MenuItem {
  roleDisplayName?: string;
  roleDisplayNameIt?: string;
  roleName?: string;
  icon?: string;
  url?: string;
  safeIcon?: SafeHtml;
}

interface SidebarGroup {
  key: string;
  title: string;
   icon?: SafeHtml;
  items: MenuItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterModule, TranslatePipe, NgFor, NgIf, LowerCasePipe],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {

  groupedMenus: SidebarGroup[] = [];
  standaloneMenus: MenuItem[] = [];
  user: any = null;
  lang : any = "en";
  constructor(
    private sanitizer: DomSanitizer,
    private authService: AuthService,
    private store: Store
  ) {}

  ngOnInit(): void {
    this.store.select(selectAuthUser).pipe(take(1)).subscribe((authUser: any) => {

      const menuSource = authUser?.menu || authUser?.data?.menu;

      if (Array.isArray(menuSource)) {
        const flatMenu = menuSource.map((m: any) => ({
          ...m,
          url: m.url || m.link || m.path || m.route,
          safeIcon: m.icon ? this.sanitizeIcon(m.icon) : ''
        }));

        this.buildAccordionMenu(flatMenu);
      }

      this.user = authUser?.user || authUser;
    });
  }


get currentLang(): string {
  this.lang = sessionStorage.getItem('lang') || 'en';
  return this.lang;
}

private buildAccordionMenu(flatMenu: MenuItem[]) {

  const groupedItemNames = SIDEBAR_GROUPS.flatMap(group => group.items);

  // GROUPED MENUS WITH ICON
  this.groupedMenus = SIDEBAR_GROUPS
    .map(group => ({
      key: group.key,
      title: group.title,
      icon: group.icon
        ? this.sanitizer.bypassSecurityTrustHtml(group.icon)
        : undefined,
      items: flatMenu.filter(m =>
        group.items.includes(m.roleDisplayName || '')
      )
    }))
    .filter(group => group.items.length > 0);
    const lang = this.lang;
  // STANDALONE MENUS (neeche)
  this.standaloneMenus = flatMenu.filter(m =>
    !groupedItemNames.includes(m.roleDisplayName || '') &&
     m.roleDisplayName !== (lang === 'it' ? 'Pannello di controllo' : 'Dashboard')
  );
}


  logout() {
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

