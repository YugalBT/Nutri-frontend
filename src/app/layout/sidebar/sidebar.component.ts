import { Component } from '@angular/core';
import { DashboardComponent } from '../../features/dashboard/dashboard.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [DashboardComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {

}
