import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { User } from '../../state/auth/auth.models';
import { Store } from '@ngrx/store';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { selectAuthUser } from '../../state/auth/auth.selectors';
import { CommonModule } from '@angular/common';
import { UpdateProfileService } from '../../core/services/profile/update-profile.service';
import { ToastrService } from 'ngx-toastr';
import { refreshAuthUser } from '../../state/auth/auth.actions';
import { SharedModule } from '../../shared/shared.module';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule,SharedModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  user$: Observable<User | null>;
  profileForm!: FormGroup;

  constructor(
    private toast: ToastrService,
    private store: Store,
    private fb: FormBuilder,
    private profileService: UpdateProfileService,
        
  ) {
    this.user$ = this.store.select(selectAuthUser);
  }

  ngOnInit() {
    this.user$.pipe(take(1)).subscribe((user) => {
      if (user) {
        this.profileForm = this.fb.group({
          firstName: [user.firstName, [Validators.required,Validators.minLength(3), Validators.maxLength(50)]],
          middleName: [user.middleName || ''],
          lastName: [user.lastName, [Validators.required,Validators.minLength(3), Validators.maxLength(50)]],
          email: [{ value: user.email, disabled: true }, Validators.required],
          phone: [user.phone || '', [Validators.required,Validators.pattern('^[0-9]{10}$')]],
        });
      }
    });
  }

 onSubmit() {
  if (this.profileForm.invalid) return;

  const payload = this.profileForm.getRawValue();
  delete payload.email;

  this.profileService.updateProfile(payload).subscribe((res) => {
    if (res.isSuccess) {
      this.toast.success(res.message);
      this.store.dispatch(refreshAuthUser());
    } else {
      this.toast.error(res.message);
    }
  });
}


}
