import { ChangeDetectorRef, Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from './translate.service';
import { Subscription } from 'rxjs';

@Pipe({ name: 'translate', pure: false, standalone: true })
export class TranslatePipe implements PipeTransform {
  private lastKey: string | null = null;
  private lastValue: string | null = null;
  private subMissing: Subscription | null = null;
  private subLang: Subscription | null = null;

  constructor(private translate: TranslateService, private cdr: ChangeDetectorRef) {
    this.subLang = this.translate.lang$.subscribe(() => {
      if (this.lastKey) {
        const v = this.translate.instant(this.lastKey);
        this.lastValue = v ?? '';
        this.cdr.markForCheck();
      }
    });
  }

  transform(key: string): string {
    if (!key) return '';

    if (this.lastKey === key && this.lastValue !== null) {
      return this.lastValue;
    }

    this.lastKey = key;

    const instant = this.translate.instant(key);
    if (instant !== undefined) {
      this.lastValue = instant;
      return instant;
    }

    this.subMissing?.unsubscribe();
    this.subMissing = this.translate.get(key).subscribe((val) => {
      if (this.lastKey === key) {
        this.lastValue = val || '';
        this.cdr.markForCheck();
      }
    });

    return this.lastValue || '';
  }

  ngOnDestroy() {
    this.subMissing?.unsubscribe();
    this.subLang?.unsubscribe();
  }
}
