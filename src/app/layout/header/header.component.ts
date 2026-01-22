// import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
// import { Route, Router, RouterLink } from "@angular/router";
// import { CommonModule } from '@angular/common';
// import { Store } from '@ngrx/store';
// import { Observable } from 'rxjs';
// import { selectAuthUser } from '../../state/auth/auth.selectors';
// import { User } from '../../state/auth/auth.models';
// import * as AuthActions from '../../state/auth/auth.actions';
// import { TranslateService } from '../../i18n/translate.service';
// import { TranslatePipe } from '../../i18n/translate.pipe';
// import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
// import { NotificationService } from '../../core/services/notification/notification.service';
// import { NotificationList } from '../../core/models/notification-list';
// import { AuthService } from '../../core/auth/auth.service';

// @Component({
//   selector: 'app-header',
//   standalone: true,
//   imports: [RouterLink, CommonModule, TranslatePipe, ConfirmDialogComponent],
//   templateUrl: './header.component.html',
//   styleUrls: ['./header.component.css']
// })
// export class HeaderComponent implements OnInit {

//   user$: Observable<User | null>;
//   currentLang = 'en';
//   darkMode = false;
//   @ViewChild(ConfirmDialogComponent) confirmDialog!: ConfirmDialogComponent;
//   notificationsData: any[] = [];
//   @Output() toggleSidebar = new EventEmitter<void>();


//   constructor(private store: Store,
//     private translate: TranslateService,
//     private authService: AuthService,
//     private notificationService: NotificationService,
//     private router: Router
//   ) {
//     this.user$ = this.store.select(selectAuthUser);
//     // initialize language from sessionStorage (if previously selected)
//     const saved = localStorage.getItem('lang');
//     if (saved) {
//       this.currentLang = saved;
//       this.translate.use(this.currentLang).subscribe();
//     } else {
//       this.translate.use(this.currentLang).subscribe();
//     }
//     // initialize theme from sessionStorage
//     const theme = localStorage.getItem('theme');
//     this.darkMode = theme === 'dark';
//     this.applyTheme();
//   }

//   ngOnInit(): void {
//     this.loadNotifications();
//   }

//   logout() {
//     this.authService.logout();
//   }
//   onConfirm(result: boolean) {
//     if (result) {
//       this.store.dispatch(AuthActions.logout());
//     }
//   }

//   showNotificationPopup = false;

//   toggleNotificationPopup() {
//     this.showNotificationPopup = !this.showNotificationPopup;
//   }

//   closePopup() {
//     this.showNotificationPopup = false;
//   }

//   goToAllNotifications() {
//     this.closePopup();
//     this.router.navigate(['/notifications']);
//   }

//   changeLanguage(lang: string) {
//     if (!lang) return;
//     this.currentLang = lang;
//     localStorage.setItem('lang', lang);
//     this.translate.use(lang).subscribe();
//   }

//   toggleDarkMode() {
//     this.darkMode = !this.darkMode;
//     localStorage.setItem('theme', this.darkMode ? 'dark' : 'light');
//     this.applyTheme();
//   }

//   private applyTheme() {
//     try {
//       const root = document.documentElement;
//       if (this.darkMode) {
//         root.classList.add('dark-mode');
//       } else {
//         root.classList.remove('dark-mode');
//       }
//     } catch (e) {
//       // noop (avoid errors in SSR)
//     }
//   }



//   loadNotifications(): void {
//     this.notificationService.getNotificationList().subscribe({
//       next: (res) => {
//         if (res.isSuccess && Array.isArray(res.data)) {
//           this.notificationsData = res.data.map((n: NotificationList) => ({
//             title: n.subject,
//             description: n.body,
//             createdDate: n.createdDate ? new Date(n.createdDate).toLocaleDateString() : '',
//             type: n.type
//           }));
//         } else {
//           this.notificationsData = [];
//         }
//       },
//       error: (err) => {
//         console.error('Error fetching notifications:', err);
//       }
//     });
//   }
// }

import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,

} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { selectAuthUser } from '../../state/auth/auth.selectors';
import { User } from '../../state/auth/auth.models';
import * as AuthActions from '../../state/auth/auth.actions';

import { TranslatePipe } from '../../i18n/translate.pipe';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { NotificationService } from '../../core/services/notification/notification.service';
import { NotificationList } from '../../core/models/notification-list';
import { AuthService } from '../../core/auth/auth.service';
import { LocalizationService } from '../../core/services/localization/localization.service';
import { LanguageList } from '../../core/models/language-list';
import { FormsModule } from '@angular/forms';
import { CompanyList } from '../../core/models/company-list';
import { CompanyService } from '../../core/services/company/company.service';
import { ApiResponse } from '../../core/models/api-response';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, CommonModule, TranslatePipe, ConfirmDialogComponent, FormsModule, MatSelectModule, MatFormFieldModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  user$: Observable<User | null>;
  languages: LanguageList[] = [];
  currentLang = 'it';

  darkMode = false;
  showNotificationPopup = false;
  notificationsData: any[] = [];
   companies: CompanyList[] = [];
  
    totalRecords = 0;
    pageSize = 10;
    pageIndex = 0;
  
    searchValue = '';
    selectedTenantId: string = '';
    impersonated = false;
    isImpersonating = false;
  @ViewChild(ConfirmDialogComponent) confirmDialog!: ConfirmDialogComponent;
  @Output() toggleSidebar = new EventEmitter<void>();

  constructor(
    private store: Store,
    private authService: AuthService,
    private notificationService: NotificationService,
    private localizationService: LocalizationService,
    private router: Router,
    private companyService: CompanyService,
  ) {
    this.user$ = this.store.select(selectAuthUser);
  }

  ngOnInit(): void {

  this.localizationService.getAllLanguages().subscribe(res => {
    this.languages = res?.data ?? [];

    this.loadCompanies(this.pageIndex, this.pageSize);
  });

  this.localizationService.getCurrentLanguage$().subscribe(lang => {
    this.currentLang = lang;
  });

  this.localizationService.initLanguage().subscribe();

  const theme = localStorage.getItem('theme');
  this.darkMode = theme === 'dark';
  this.applyTheme();

  this.loadNotifications();
  }

  /** 🔥 Language dropdown */
  changeLanguage(lang: string): void {
    this.localizationService.changeLanguage(lang).subscribe(() => {
      this.currentLang = lang;
    });
  }

  get currentLanguageName(): string {

  if (!this.currentLang) {
    return 'Select Language';
  }

  const lang = this.languages.find(
    l => l.languageCode === this.currentLang
  );

  return lang?.languageName || 'Italian';
}

  // get currentLanguageName(): string {
  //   const lang = this.languages.find(
  //     l => l.languageCode === this.currentLang
  //   );
  //   return lang?.languageName || 'English';
  // }

  /** 🔹 Logout */
  logout(): void {
    this.authService.logout();
  }

  onConfirm(result: boolean): void {
    if (result) {
      this.store.dispatch(AuthActions.logout());
    }
  }

  /** 🔹 Notifications */
  toggleNotificationPopup(): void {
    this.showNotificationPopup = !this.showNotificationPopup;
  }

  closePopup(): void {
    this.showNotificationPopup = false;
  }

  goToAllNotifications(): void {
    this.closePopup();
    this.router.navigate(['/notifications']);
  }

  loadNotifications(): void {
    this.notificationService.getNotificationList().subscribe({
      next: (res) => {
        if (res.isSuccess && Array.isArray(res.data)) {
          this.notificationsData = res.data.map((n: NotificationList) => ({
            title: n.subject,
            description: n.body,
            createdDate: n.createdDate
              ? new Date(n.createdDate).toLocaleDateString()
              : '',
            type: n.type
          }));
        } else {
          this.notificationsData = [];
        }
      },
      error: err => console.error(err)
    });
  }

  /** 🔹 Theme */
  toggleDarkMode(): void {
    this.darkMode = !this.darkMode;
    localStorage.setItem('theme', this.darkMode ? 'dark' : 'light');
    this.applyTheme();
  }

  private applyTheme(): void {
    const root = document.documentElement;
    this.darkMode
      ? root.classList.add('dark-mode')
      : root.classList.remove('dark-mode');
  }


  private loadCompanies(pageNo: number, recordPerPage: number) {
    debugger;
    const payload = {
      searchValue: this.searchValue ?? '',
      pageNo,
      recordPerPage,
      status: 1,
    };


    const sub = this.companyService.getAllMappedCompanies(payload)
      .subscribe({
        next: (res: ApiResponse<any>) => {
          this.companies = (res.data ?? []).map((item: any) => ({
            ...item,
            fullName: `${item.firstName ?? ''} ${item.lastName ?? ''}`.trim()
          }));

          this.totalRecords = res.totalRecords
            ?? res.data?.totalRecords
            ?? this.companies.length;
        },
        error: () => {
          this.companies = [];
          this.totalRecords = 0;
        }
      });

      
   
  }
  onCompanyChange(tenantId: string) {
  if (!tenantId) return;

  // store admin session ONCE
  if (!localStorage.getItem('adminSnapshot')) {
    localStorage.setItem(
      'adminSnapshot',
      JSON.stringify({
        token: localStorage.getItem('authToken'),
        user: localStorage.getItem('userdata')
      })
    );
  }

  

  this.authService.impersonateCompany(tenantId)
    .subscribe(res => {
      if (res.isSuccess && res.data) {
        this.activateImpersonation(res.data);
        this.impersonated = true;
      }
    });
}
callApi() {
  if (!this.selectedTenantId || this.isImpersonating) return;

  this.isImpersonating = true;
  this.onCompanyChange(this.selectedTenantId);
}
private activateImpersonation(data: any) {
  localStorage.setItem('authToken', data.token);
  localStorage.setItem('userdata', JSON.stringify(data));
  localStorage.setItem('ImpersonateTenant', 'Yes');
  
  this.store.dispatch(AuthActions.loginSuccess({ user: data , token: data.token}));

  this.router.navigateByUrl('/', { replaceUrl: true });
}

backToAdmin(): void {
  const snapshot = localStorage.getItem('adminSnapshot');
  if (!snapshot) return;

  const admin = JSON.parse(snapshot);

  localStorage.setItem('authToken', admin.token);
  localStorage.setItem('userdata', admin.user);
  localStorage.removeItem('ImpersonateTenant');
  localStorage.removeItem('adminSnapshot');

  this.store.dispatch(
    AuthActions.loginSuccess({
      user: JSON.parse(admin.user),
      token: admin.token
    })
  );

  this.impersonated = false;
  this.router.navigateByUrl('/', { replaceUrl: true });
}


}
