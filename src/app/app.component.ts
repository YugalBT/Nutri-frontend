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
import { LocalizationService } from './core/services/localization/localization.service';
import { selectAuthUser } from './state/auth/auth.selectors';
import { BrandingService } from './shared/services/branding.service';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, NgxSpinnerModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'nutri-frontend';

  constructor(
    private router: Router,
    private store: Store<{ auth: AuthState }>,
    private tokenService: TokenService,
    private spinner: NgxSpinnerService,
    private localizationService: LocalizationService,
    private brandingService: BrandingService
  ) { }

  ngOnInit() {
    this.brandingService.initialize();

    const token = this.tokenService.getToken();
        const user: User | null = JSON.parse(this.tokenService.getUserData() || 'null');

        if (token && user && !this.tokenService.isTokenExpired()) {
          this.store.dispatch(AuthActions.loginSuccess({ user, token, silent: true }));
        } 

    this.store.select(selectAuthUser).subscribe((authUser) => {
      this.brandingService.updateBranding(authUser);
    });
  // this.router.events.subscribe(event => {
  //   if (event instanceof NavigationEnd) {
  //     const url = event.url;
  //     if (!url.includes('/login')) { 
  //       const token = this.tokenService.getToken();
  //       const user: User | null = JSON.parse(this.tokenService.getUserData() || 'null');

  //       if (token && user && !this.tokenService.isTokenExpired()) {
  //         this.store.dispatch(AuthActions.loginSuccess({ user, token, silent: true }));
  //       } else {
  //         this.tokenService.clearAll();
  //         this.store.dispatch(AuthActions.logout());
  //       }
  //     }
  //   }
  // });
    this.localizationService.initLanguage().subscribe();
}

}
