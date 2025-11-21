import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../../state/auth/auth.models';
import { Store } from '@ngrx/store';
import { selectAuthUser } from '../../state/auth/auth.selectors';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {

  user$: Observable<User | null>;

  constructor(private store: Store) {
    this.user$ = this.store.select(selectAuthUser);
  }
}
