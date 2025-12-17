import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
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
import { CustomValidators } from '../../core/helpers/validators';
import * as AuthActions from '../../state/auth/auth.actions';  
import { CommonService } from '../../shared/services/common.service';
import { PERMISSIONS } from '../../core/constants/permissions.constants';
import { ImageValidatorDirective } from '../../image-validator.directive'; 
import { TranslatePipe } from '../../i18n/translate.pipe';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule, SharedModule,TranslatePipe,ImageValidatorDirective],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  user$: Observable<User | null>;
  profileForm!: FormGroup;
  @ViewChild('fileInput') fileInput!: ElementRef;

  constructor(
    private toast: ToastrService,
    private store: Store,
    private fb: FormBuilder,
    private profileService: UpdateProfileService,
    private commonService :CommonService

  ) {
    this.user$ = this.store.select(selectAuthUser);
  }

  ngOnInit() {

    if(!this.commonService.checkPermission(PERMISSIONS.ProfileEdit)
      || !this.commonService.checkPermission(PERMISSIONS.ProfileView))
        return;
    this.profileService.profileDetails().pipe(take(1)).subscribe((res) => {
      if (res.isSuccess && res.data) {

        const user = res.data;

        this.profileForm = this.fb.group({
          firstName: [user.firstName, [Validators.required, Validators.minLength(3), Validators.maxLength(50), Validators.pattern('^[A-Za-z]+$')]],
          middleName: [user.middleName || '',[Validators.minLength(3), Validators.maxLength(50), Validators.pattern('^[A-Za-z]+$')]],
          lastName: [user.lastName, [Validators.required, Validators.minLength(3), Validators.maxLength(50), Validators.pattern('^[A-Za-z]+$')]],
          email: [{ value: user.email, disabled: true }, CustomValidators.required],
          phone: [user.phone || '', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
          logo: [user.logo || null],
        }); 
        this.imagePreview = user.logo || null;

      } else {
        this.toast.error(res.message);
      }
    });
  }
  imagePreview: string | null =  null;

  // onProfileImageChange(event: any) {
  //   const file = event.target.files[0];
  //   if (!file) return;

  //   const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
  //   if (!allowedTypes.includes(file.type)) {
  //     this.toast.error("Only PNG/JPEG files allowed");
  //     this.fileInput.nativeElement.value = '';
  //     return;
  //   }

  //   const reader = new FileReader();
  //   reader.onload = () => {
  //     this.imagePreview = reader.result as string;
  //     this.profileForm.patchValue({ logo: reader.result });
  //   };
  //   reader.readAsDataURL(file);
  // }

removeImage() {
  this.profileForm.get('logo')?.reset();
}

  // removeImage() {
  //   this.imagePreview = null;
  //   this.profileForm.patchValue({ logo: null });

  //   if (this.fileInput) {
  //     this.fileInput.nativeElement.value = '';
  //   }
  // }

  onSubmit() {
  if (this.profileForm.invalid) {
    this.toast.error('Please correct the errors in the form before submitting.');
    return;
  }

  const payload = this.profileForm.getRawValue();
  delete payload.email;

  this.profileService.updateProfile(payload).subscribe({
    next: (res: any) => {
      if (res.isSuccess) {
        this.toast.success(res?.message);
        this.getLatestProfileDetails();
      } else {
        this.toast.error(res?.message);
      }
    },
    error: (err: any) => {
      const message = err?.error?.message;
      this.toast.error(message);
    }
  });
}


 getLatestProfileDetails() {
  this.profileService.profileDetails().pipe(take(1)).subscribe(res => {
    if (res?.isSuccess && res?.data) {

      this.store.select(selectAuthUser).pipe(take(1)).subscribe((currentUser) => {
        if (currentUser) {
          const updatedUser: User = {
            ...currentUser,   
            ...res.data  
          };

          this.store.dispatch(AuthActions.updateProfileSuccess({ user: updatedUser }));
        }
      });
    }
  });
}




}
