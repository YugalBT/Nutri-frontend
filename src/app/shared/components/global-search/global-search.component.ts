import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { TranslateService } from '../../../i18n/translate.service';
import { TranslatePipe } from '../../../i18n/translate.pipe';

@Component({
  selector: 'app-global-search',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './global-search.component.html',
  styleUrls: ['./global-search.component.css']
})
export class GlobalSearchComponent implements OnInit, OnDestroy {

  constructor(private translate: TranslateService) {}
  @Input() label: string = 'Search';
  @Input() placeholder = 'Enter keyword';
  @Input() showStatus = false;
  @Input() debounceTime = 300;

  @Output() search = new EventEmitter<string>();
  @Output() statusChange = new EventEmitter<number | null>();
  @Output() clear = new EventEmitter<void>();

  searchControl = new FormControl('');
  statusControl = new FormControl('');
  private subs: Subscription[] = [];

  ngOnInit(): void {
    this.subs.push(
      this.searchControl.valueChanges
        .pipe(debounceTime(this.debounceTime), distinctUntilChanged())
        .subscribe((text) => {
          this.search.emit(text || '');
        })
    );

   this.subs.push(
    this.statusControl.valueChanges.subscribe((status) => {
    const s = status === '' ? null : Number(status);
    this.statusChange.emit(s);
  })
);

  }

  doClear() {
    this.searchControl.setValue('');
    this.statusControl.setValue('');
    this.clear.emit();
    this.search.emit('');
    this.statusChange.emit(null);
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }
}
