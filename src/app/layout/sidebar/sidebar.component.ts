import { Component } from '@angular/core';
import { DashboardComponent } from '../../features/dashboard/dashboard.component';
import { HeaderComponent } from "../header/header.component";
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [DashboardComponent, HeaderComponent, RouterLink],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {

}
