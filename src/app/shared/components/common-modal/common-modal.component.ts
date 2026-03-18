import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslatePipe } from '../../../i18n/translate.pipe';
import { SharedModule } from '../../shared.module';

@Component({
  selector: 'app-common-modal',
  standalone: true,
  imports: [TranslatePipe, SharedModule],
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
