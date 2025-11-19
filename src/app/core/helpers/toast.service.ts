import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  constructor(private toastr: ToastrService) {}

  success(message: string, title: string = 'Success', timeout?: number) {
    this.toastr.success(message, title, { timeOut: timeout ?? 3000 });
  }

  error(message: string, title: string = 'Error', timeout?: number) {
    this.toastr.error(message, title, { timeOut: timeout ?? 3000 });
  }

  warning(message: string, title: string = 'Warning', timeout?: number) {
    this.toastr.warning(message, title, { timeOut: timeout ?? 3000 });
  }

  info(message: string, title: string = 'Info', timeout?: number) {
    this.toastr.info(message, title, { timeOut: timeout ?? 3000 });
  }
}
