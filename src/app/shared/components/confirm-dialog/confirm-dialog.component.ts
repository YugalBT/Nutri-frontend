import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, output } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.css'
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
