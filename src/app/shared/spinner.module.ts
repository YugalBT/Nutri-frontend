import { NgModule } from '@angular/core';
import { NgxSpinnerModule } from 'ngx-spinner';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [
    CommonModule,
    NgxSpinnerModule
  ],
  exports: [
    NgxSpinnerModule
  ]
})
export class SpinnerModule {}
