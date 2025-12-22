import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConfigurationService } from '../../core/services/configuration/configuration.service';
import { ToastService } from '../../shared/services/toast.service';
import { SharedModule } from '../../shared/shared.module';
import { TranslatePipe } from '../../i18n/translate.pipe';

@Component({
  selector: 'app-configuration',
  standalone: true,
  imports: [SharedModule,TranslatePipe],
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.css']
})
export class ConfigurationComponent implements OnInit {

  emailForm!: FormGroup;
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private configuration: ConfigurationService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.loadEmailConfiguration();
  }

  toggle(type: string) {
    if (type === 'password') this.showPassword = !this.showPassword;
  }

  buildForm() {
    this.emailForm = this.fb.group({
      emailType: [null, Validators.required],
      username: ['', Validators.required],
      from: ['', Validators.required],
      replyTo: [''],
      smtpServer: [''],
      port: [0],
      password: [''],
      useSsl: [false],
      accessToken: [''],
      accessExpirationtime: [null]
    });
  }

  loadEmailConfiguration() {
    this.configuration.getConfiguration().subscribe({
      next: (res: any) => {
        if (res.isSuccess && res.data) {
          this.emailForm.patchValue(res.data);
        }
      },
      error: () => this.toast.error('Failed to load email configuration')
    });
  }

  onSubmit() {
    if (this.emailForm.invalid) {
      this.emailForm.markAllAsTouched();
      return;
    }

    const payload = {
      smtpServer: this.emailForm.value.smtpServer,
      port: this.emailForm.value.port,
      username: this.emailForm.value.username,
      password: this.emailForm.value.password,
      useSsl: this.emailForm.value.useSsl,
      replyTo: this.emailForm.value.replyTo,
      emailType: this.emailForm.value.emailType,
      from: this.emailForm.value.from,
      accessToken: this.emailForm.value.accessToken
    };

    this.configuration.updateConfiguration(payload).subscribe({
      next: (res: any) => {
        res.isSuccess ? this.toast.success(res.message) : this.toast.error(res.message);
      },
      error: (err) => {
        this.toast.error(err?.error?.message || 'Something went wrong');
      }
    });
  }
}
