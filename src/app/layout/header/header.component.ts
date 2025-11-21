import { Component } from '@angular/core';
import { RouterLink } from "@angular/router";
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { selectAuthUser } from '../../state/auth/auth.selectors';
import { User } from '../../state/auth/auth.models';
import * as AuthActions from '../../state/auth/auth.actions';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  user$: Observable<User | null>;

  constructor(private store: Store) {
    this.user$ = this.store.select(selectAuthUser);
  }
 
  logout() {
    this.store.dispatch(AuthActions.logout());
  }
}
