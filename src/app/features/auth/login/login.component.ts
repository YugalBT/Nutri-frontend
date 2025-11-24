import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import { TranslateService } from '../../../i18n/translate.service';
import { TranslatePipe } from '../../../i18n/translate.pipe';
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
  imports: [SharedModule, TranslatePipe]
})
export class LoginComponent {
  form: FormGroup;
  icons = ICONS;
  loading$: Observable<boolean>; 

  constructor(private fb: FormBuilder, private store: Store, private toast: ToastService, private translate: TranslateService) {
    this.form = this.fb.group({
      username: ['', [CustomValidators.required()]],
      password: ['', [CustomValidators.required()]]
    });

    this.loading$ = this.store.select(selectAuthLoading);
    
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.error(this.translate.instant('auth.fillRequired') || 'Please fill all required fields');
      return;
    }

    

    const { username, password } = this.form.value;
    this.store.dispatch(AuthActions.login({ username, password, companyCode: 'set' })); 
}


showPassword: boolean = false;
togglePassword() {
  this.showPassword = !this.showPassword;
}
}