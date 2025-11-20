import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { ToastService } from '../../../shared/services/toast.service';
import * as AuthActions from '../../../state/auth/auth.actions';
import { selectAuthLoading } from '../../../state/auth/auth.selectors';
import { SharedModule } from '../../../shared/shared.module';
import { ICONS } from '../../../shared/svgfiles/svgicons';
import { CustomValidators } from '../../../core/helpers/validators';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [SharedModule]
})
export class LoginComponent {
  form: FormGroup;
  icons = ICONS;
  loading$: Observable<boolean>; 

  constructor(private fb: FormBuilder, private store: Store, private toast: ToastService) {
    this.form = this.fb.group({
      username: ['', [CustomValidators.required()]],
      password: ['', [CustomValidators.required()]]
    });

    this.loading$ = this.store.select(selectAuthLoading);
    // console.log('Loading Observable:', this.loading$);
    
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.error('Please fill all required fields');
      return;
    }

    const { username, password } = this.form.value;
    this.store.dispatch(AuthActions.login({ username, password, companyCode: 'set' })); 
}
}