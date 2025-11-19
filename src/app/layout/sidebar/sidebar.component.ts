import { Component } from '@angular/core';
import { DashboardComponent } from '../../features/dashboard/dashboard.component';
import { HeaderComponent } from "../header/header.component";
import { Router, RouterLink } from "@angular/router";
import { ConfirmDialogService } from '../../core/helpers/confirm-dialog.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {

  constructor(private router: Router, private confirm: ConfirmDialogService) {}

  logout() {
    debugger;
    this.confirm.confirm('Do you really want to logout?').subscribe(result => {
      if (result) {
        localStorage.clear();
        this.router.navigate(['/login']);
      }
    });
  }
}
