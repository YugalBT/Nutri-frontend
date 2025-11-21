import { Component } from '@angular/core';
import { DashboardComponent } from '../../features/dashboard/dashboard.component';
import { HeaderComponent } from "../header/header.component";
import { Router, RouterLink } from "@angular/router";
import { ConfirmDialogService } from '../../shared/services/confirm-dialog.service';
import { ToastService } from '../../shared/services/toast.service';
import { TranslateService } from '../../i18n/translate.service';
import { TranslatePipe } from '../../i18n/translate.pipe';
import { Constants } from '../../shared/utils/constants/constants';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {

  constructor(
    private router: Router,
     private confirm: ConfirmDialogService,
     private toast: ToastService,
     private translate: TranslateService
    ) {}

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
