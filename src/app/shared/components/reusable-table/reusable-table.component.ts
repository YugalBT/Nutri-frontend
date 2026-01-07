import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatBadgeModule } from '@angular/material/badge';
import { TranslatePipe } from '../../../i18n/translate.pipe';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-reusable-table',
  standalone: true,
  imports: [CommonModule, MatPaginatorModule, MatBadgeModule, TranslatePipe, MatTooltipModule],
  templateUrl: './reusable-table.component.html',
  styleUrls: ['./reusable-table.component.css']
})
export class ReusableTableComponent implements OnChanges {

  NoImagePath: string = '/assets/image/no-image.png';
  @Input() showFooter: boolean = false;   //  default OFF
  @Input() footerTotals?: Record<string, number>;

  @Input() columns: string[] = [];
  @Input() columnFields?: string[];
  @Input() data: Record<string, any>[] = [];

  @Input() showActions: boolean = false;

  @Input() pageable: boolean = false;
  @Input() totalRecords: number = 0;

  @Input() pageSize = 10;
  @Input() pageIndex = 0;

  @Output() pageChange = new EventEmitter<{ pageIndex: number; pageSize: number }>();
  @Output() editRow = new EventEmitter<any>();
  @Output() deleteRow = new EventEmitter<any>();
  @Output() toggleActive = new EventEmitter<{ row: any; isActive: boolean }>();

  @Input() clickableField?: string;
  @Output() cellClick = new EventEmitter<{ field: string; row: any }>();

  ngOnChanges(changes: SimpleChanges) {
    if (changes['pageIndex'] && !changes['pageIndex'].isFirstChange()) {
      const incoming = changes['pageIndex'].currentValue as number;
      const total = this.totalPages;
      this.pageIndex = Math.max(0, Math.min(incoming, total - 1));
    }

    if ((changes['pageSize'] || changes['totalRecords']) && !changes['pageSize']?.isFirstChange()) {
      const total = this.totalPages;
      if (this.pageIndex >= total) {
        this.pageIndex = Math.max(0, total - 1);
      }
    }
  }

  get totalPages(): number {
    if (!this.pageSize) return 0;
    return Math.ceil(this.totalRecords / this.pageSize);
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i);
  }

  getCell(row: any, field: string) {
    if (!row || !field) return { type: 'text', value: '' };

    const val = row[field];

    if (field === 'logo') return { type: 'logo', value: val || this.NoImagePath };
    if (field.toLowerCase() === 'isactive') return { type: 'switch', value: !!val };
    if (typeof val === 'string' && /^#([A-F0-9]{3}|[A-F0-9]{6})$/i.test(val)) return { type: 'color', value: val };

    if (Array.isArray(val) && val.some(v => this.isUrl(v))) return { type: 'images', value: val };
    if (typeof val === 'string' && this.isUrl(val)) return { type: 'images', value: [val] };

    if (typeof val === 'boolean') return { type: 'boolean', value: val };

    return { type: 'text', value: val ?? '' };
  }

  isUrl(v: any) {
    return typeof v === 'string' && /^(https?:\/\/|\/|data:)/i.test(v);
  }

  onImgError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.onerror = null;
    img.src = this.NoImagePath;
  }

  onToggle(row: any, event: any) {
    this.toggleActive.emit({
      row,
      isActive: event.target.checked
    });
  }


  onCellClick(field: string, row: any): void {
    if (this.clickableField && field !== this.clickableField) return;
    this.cellClick.emit({ field, row });
  }


  onPaginate(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;

    this.pageChange.emit({
      pageIndex: event.pageIndex,
      pageSize: event.pageSize
    });
  }
}
