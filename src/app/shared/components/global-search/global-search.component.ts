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
  @Output() isShow = new EventEmitter<boolean>();


  searchControl = new FormControl('');
  statusControl = new FormControl<string | null>('');
  isShowControl = new FormControl(false);
  isSuperAdmin = false;
  private subs: Subscription[] = [];

  ngOnInit(): void {
    sessionStorage.getItem('isSuperAdmin') === 'true' ? this.isSuperAdmin = true : this.isSuperAdmin = false;
    this.subs.push(
      this.searchControl.valueChanges
        .pipe(debounceTime(this.debounceTime), distinctUntilChanged())
        .subscribe((text) => {
          this.search.emit(text || '');
        })
    );

    this.subs.push(
      this.statusControl.valueChanges.subscribe(val => {
        // Convert string to number or null
        if (val === '' || val === null) {
          this.statusChange.emit(null);
        } else {
          this.statusChange.emit(parseInt(val, 10));
        }
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
