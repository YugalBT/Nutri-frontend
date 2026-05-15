import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../../i18n/translate.pipe';

export interface DateRangeFilter {
  startDate: string | null;
  endDate: string | null;
}

@Component({
  selector: 'app-date-range-filter',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './date-range-filter.component.html',
  styleUrl: './date-range-filter.component.css',
})
export class DateRangeFilterComponent implements OnInit {
  @Input() label: string = 'Date Range';
  @Input() startDateLabel: string = 'Start Date';
  @Input() endDateLabel: string = 'End Date';
  @Input() startDate: string | null = null;
  @Input() endDate: string | null = null;
  
  @Output() dateRangeChange = new EventEmitter<DateRangeFilter>();
  @Output() apply = new EventEmitter<DateRangeFilter>();

  localStartDate: string | null = null;
  localEndDate: string | null = null;

  ngOnInit(): void {
    this.localStartDate = this.startDate || null;
    this.localEndDate = this.endDate || null;
  }

  ngOnChanges(): void {
    if (this.startDate) this.localStartDate = this.startDate;
    if (this.endDate) this.localEndDate = this.endDate;
  }

  onDateChange(): void {
    if (this.localStartDate && this.localEndDate) {
      if (new Date(this.localStartDate) > new Date(this.localEndDate)) {
        return;
      }
    }
    
    this.dateRangeChange.emit({
      startDate: this.localStartDate,
      endDate: this.localEndDate,
    });
  }

  onApply(): void {
    if (!this.localStartDate || !this.localEndDate) {
      return;
    }

    if (new Date(this.localStartDate) > new Date(this.localEndDate)) {
      return;
    }

    this.apply.emit({
      startDate: this.localStartDate,
      endDate: this.localEndDate,
    });
  }

  onReset(): void {
    this.localStartDate = null;
    this.localEndDate = null;
    this.dateRangeChange.emit({
      startDate: null,
      endDate: null,
    });
  }
}
