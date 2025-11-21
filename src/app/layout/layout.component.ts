import { Component } from '@angular/core';
import { DashboardComponent } from '../features/dashboard/dashboard.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { LoaderComponent } from '../shared/components/loader/loader.component';


@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [SidebarComponent, HeaderComponent, RouterOutlet],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent {

}
