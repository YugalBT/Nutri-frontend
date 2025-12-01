import { Component, OnInit, ViewChild } from '@angular/core';
import { Route, Router, RouterLink } from "@angular/router";
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { selectAuthUser } from '../../state/auth/auth.selectors';
import { User } from '../../state/auth/auth.models';
import * as AuthActions from '../../state/auth/auth.actions';
import { TranslateService } from '../../i18n/translate.service';
import { TranslatePipe } from '../../i18n/translate.pipe';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { NotificationService } from '../../core/services/notification/notification.service';
import { NotificationList } from '../../core/models/notification-list';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, CommonModule, TranslatePipe,ConfirmDialogComponent],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  user$: Observable<User | null>;
  currentLang = 'en';
  darkMode = false;
    @ViewChild(ConfirmDialogComponent) confirmDialog!: ConfirmDialogComponent;
    notificationsData: any[] = [];

  constructor(private store: Store,
     private translate: TranslateService,
     private notificationService: NotificationService,
      private router:Router
    ) {
    this.user$ = this.store.select(selectAuthUser);
    // initialize language from localStorage (if previously selected)
    const saved = localStorage.getItem('lang');
    if (saved) {
      this.currentLang = saved;
      this.translate.use(this.currentLang).subscribe();
    } else {
      this.translate.use(this.currentLang).subscribe();
    }
    // initialize theme from localStorage
    const theme = localStorage.getItem('theme');
    this.darkMode = theme === 'dark';
    this.applyTheme();
  }

  ngOnInit(): void {
    this.loadNotifications();
  }
 
  logout() {
    
   
     this.confirmDialog.show('Are you sure you want to logout?');
  }
   onConfirm(result: boolean) {
    if (result) {
      this.store.dispatch(AuthActions.logout()); 
    }
  }

  showNotificationPopup = false;

toggleNotificationPopup() {
  this.showNotificationPopup = !this.showNotificationPopup;
}

closePopup() {
  this.showNotificationPopup = false;
}

goToAllNotifications() {
  this.closePopup();
  this.router.navigate(['/notifications']);
}

  changeLanguage(lang: string) {
    if (!lang) return;
    this.currentLang = lang;
    localStorage.setItem('lang', lang);
    this.translate.use(lang).subscribe();
  }

  toggleDarkMode() {
    this.darkMode = !this.darkMode;
    localStorage.setItem('theme', this.darkMode ? 'dark' : 'light');
    this.applyTheme();
  }

  private applyTheme() {
    try {
      const root = document.documentElement;
      if (this.darkMode) {
        root.classList.add('dark-mode');
      } else {
        root.classList.remove('dark-mode');
      }
    } catch (e) {
      // noop (avoid errors in SSR)
    }
  }

  
  
    loadNotifications(): void {
      this.notificationService.getNotificationList().subscribe({
        next: (res) => {
          if (res.isSuccess && Array.isArray(res.data)) {
            this.notificationsData = res.data.map((n: NotificationList) => ({
              title: n.subject,
              description: n.body,
              createdDate: n.createdDate ? new Date(n.createdDate).toLocaleDateString() : '',
              type: n.type
            }));
          } else {
            this.notificationsData = [];
          }
        },
        error: (err) => {
          console.error('Error fetching notifications:', err);
        }
      });
    }
}
