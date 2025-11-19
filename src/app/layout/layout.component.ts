import { Component } from '@angular/core';
import { DashboardComponent } from '../features/dashboard/dashboard.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { LoaderComponent } from '../shared/components/loader/loader.component';


@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [DashboardComponent, SidebarComponent, HeaderComponent, RouterOutlet, LoaderComponent],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent {

}
