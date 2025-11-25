import { Component, OnInit } from '@angular/core';
import { NavigationEnd, NavigationError, NavigationStart, Router, RouterOutlet } from '@angular/router';
import { SharedModule } from './shared/shared.module';
import { CommonModule } from '@angular/common';
import { ConfirmDialogComponent } from "./shared/components/confirm-dialog/confirm-dialog.component";
import { LoaderComponent } from './shared/components/loader/loader.component';
import { LoaderService } from './shared/services/loader.service';
import { Store } from '@ngrx/store';
import * as AuthActions from './state/auth/auth.actions';
import { AuthState } from './state/auth/auth.state';
import { User } from './state/auth/auth.models';
import { TokenService } from './shared/services/token.service';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, LoaderComponent, NgxSpinnerModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'nutri-frontend';
  
   constructor(
    private router: Router,
    public loader: LoaderService,
    private store: Store<{ auth: AuthState }>,
    private tokenService: TokenService,
    private spinner: NgxSpinnerService
  ) {}
  
    ngOnInit() {
      const token = this.tokenService.getToken();
    const user: User | null = JSON.parse(this.tokenService.getUserData() || 'null');

    if (token && user) {
      // If token expired, clear and logout
      if (this.tokenService.isTokenExpired()) {
        this.tokenService.clearAll();
        this.store.dispatch(AuthActions.logout());
      } else {
        // Restore session silently on app init — do not trigger success toast or navigation
        this.store.dispatch(AuthActions.loginSuccess({ user, token, silent: true }));
      }
    } else {
      this.store.dispatch(AuthActions.logout());
    }
  }
}
