import { Component } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { TranslatePipe } from '../../../i18n/translate.pipe';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [SharedModule, TranslatePipe],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {

}
