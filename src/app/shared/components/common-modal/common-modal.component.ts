import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslatePipe } from '../../../i18n/translate.pipe';

@Component({
  selector: 'app-common-modal',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './common-modal.component.html',
  styleUrls: ['./common-modal.component.css']
})
export class CommonModalComponent {
 @Input() title = 'Modal Title';
  @Output() save = new EventEmitter<void>();

  visible = false;

  show() {
    this.visible = true;
  }

  close() {
    this.visible = false;
  }
}
