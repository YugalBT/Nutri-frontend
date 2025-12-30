import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '../../i18n/translate.service';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

    constructor(
      private toastr: ToastrService,
      private translate: TranslateService 
    ) {}



  
    success(message: string, title: string = 'toast.success', timeout?: number) {
      this.toastr.success(message, this.translate.instant('toast.success'), { timeOut: timeout ?? 3000 });
    }
  
    error(message: string, title: string = 'toast.error', timeout?: number) {
      this.toastr.error(message, this.translate.instant('toast.error'), { timeOut: timeout ?? 3000 });
    }
  
    warning(message: string, title: string = 'toast.warning', timeout?: number) {
      this.toastr.warning(message, this.translate.instant('toast.warning'), { timeOut: timeout ?? 3000 });
    }
  
    info(message: string, title: string = 'Info', timeout?: number) {
      this.toastr.info(message, title, { timeOut: timeout ?? 3000 });
    }
}
