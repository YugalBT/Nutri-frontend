import { Component } from '@angular/core';
import { FormBuilder, FormGroup} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { ICONS } from '../../../shared/svgfiles/svgicons';
import { SharedModule } from '../../../shared/shared.module';
import { CustomValidators } from '../../../core/helpers/validators';
import { ToastService } from '../../../shared/services/toast.service';


@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [SharedModule]
})
export class LoginComponent {

  form: FormGroup;
  loading = false;
  icons = ICONS;
  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private toast: ToastService 
  ) {
    this.form = this.fb.group({
      email: ['', [CustomValidators.required(), CustomValidators.email()]],
      password: ['', [CustomValidators.required(), CustomValidators.password()]]
    });
  }

  onSubmit() {
     if (this.form.invalid) {
    this.form.markAllAsTouched(); 
    this.toast.error('Please fill all required fields'); 
    return;
  }

    this.loading = true;

    this.auth.login(this.form.value).subscribe({
      next: (res) => {
        // this.loading = false;
         this.toast.success('Login successful!', 'Welcome');
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.toast.error('Invalid Email or Password', 'Login Failed');
        // this.loading = false;
        
      }
    });
  }
}
