import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslatePipe } from '../../../i18n/translate.pipe';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.css']
})
export class ConfirmDialogComponent {
 @Input() title = 'Confirm';
  @Input() message = '';
  @Output() confirm = new EventEmitter<boolean>();

  visible = false;

  show(message?: string) {
    if (message) this.message = message;
    this.visible = true;
  }

  onYes() {
    this.visible = false;
    this.confirm.emit(true);
  }

  onNo() {
    this.visible = false;
    this.confirm.emit(false);
  }
}
