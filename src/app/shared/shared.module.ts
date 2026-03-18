import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslatePipe } from '../i18n/translate.pipe';



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    TranslatePipe,
    FormsModule
  ],
  exports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule
  ],
})
export class SharedModule { }
