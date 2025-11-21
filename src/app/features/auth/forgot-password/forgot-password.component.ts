import { Component } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {

}
