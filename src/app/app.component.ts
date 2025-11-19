import { Component, OnInit } from '@angular/core';
import { NavigationEnd, NavigationError, NavigationStart, Router, RouterOutlet } from '@angular/router';
import { LoaderService } from './core/services/loader.service';
import { SharedModule } from './shared/shared.module';
import { CommonModule } from '@angular/common';
import { LoaderComponent } from './shared/loader/loader.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,CommonModule,LoaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'nutri-frontend';
  constructor(private router: Router, public loader: LoaderService) {} 
  ngOnInit() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.loader.show();
      }
      if (event instanceof NavigationEnd || event instanceof NavigationError) {
        this.loader.hide();
      }
    });
  }
}
