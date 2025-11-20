
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ErrorConstants {
  autoSaveInterval = 15000;
  errorRequiredField = "Field is required.";
  errorEmailField = "Email address is invalid.";
  errorMaxLength = "Field exceeds max length.";
  moreThank0 = "Value has to be more than 0.";
  integerValue = "Value has to be an integer.";
  errorPattern = "Wrong patterns entered" 

//   public getMaxLength(len) {
//     return "Max length should be " + len + ' characters.';
//   }

//   public getMaxValue(len) {
//     return "Maximum value should be " + len + '.';
//   }
  
//   public getMinLength(len) {
//     return "Min length should be " + len + ' characters.';
//   }0000000000
//   public getMinValue(len) {
//     return "Minimum value should be " + len + '.';
//   }


}