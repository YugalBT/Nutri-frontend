import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-reusable-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reusable-table.component.html',
  styleUrls: ['./reusable-table.component.css']
})
export class ReusableTableComponent implements OnChanges {

  NoImagePath: string = '/assets/image/no-image.png';
   @Input() columns: string[] = [];
  /** Optional array of data field keys corresponding to `columns` (same length). If provided, the table
   * will read values using these keys instead of deriving from column header text. Use 'name' to
   * indicate a combined first/last name. */
  @Input() columnFields?: string[];
  @Input() data: any[] = [];
  @Input() showActions: boolean = false;
  @Input() pageable: boolean = false;
  @Input() totalRecords: number = 0;
  @Input() pageSize = 5;
  @Input() pageIndex = 0; // zero-based
  @Output() pageChange = new EventEmitter<{ pageIndex: number; pageSize: number }>();
  @Output() editRow = new EventEmitter<any>();
  @Output() deleteRow = new EventEmitter<any>();
  @Output() toggleActive = new EventEmitter<{ row: any; isActive: boolean }>();

  changePage(nextIndex: number) {
    const total = this.totalPages;
    if (nextIndex < 0) {
      nextIndex = 0;
    }
    if (nextIndex >= total) {
      nextIndex = Math.max(0, total - 1);
    }
    this.pageIndex = nextIndex;
    this.pageChange.emit({ pageIndex: this.pageIndex, pageSize: this.pageSize });
  }

  ngOnChanges(changes: SimpleChanges) {
    // If parent updates pageIndex or pageSize/totalRecords, ensure our pageIndex remains valid
    if (changes['pageIndex'] && !changes['pageIndex'].isFirstChange()) {
      const incoming = changes['pageIndex'].currentValue as number;
      const total = this.totalPages;
      if (typeof incoming === 'number') {
        // clamp incoming to valid range
        this.pageIndex = Math.max(0, Math.min(incoming, Math.max(0, total - 1)));
      }
    }
    // If pageSize or totalRecords changed, ensure current pageIndex is still in range
    if ((changes['pageSize'] || changes['totalRecords']) && !changes['pageSize']?.isFirstChange()) {
      const total = this.totalPages;
      if (this.pageIndex >= total) {
        this.pageIndex = Math.max(0, total - 1);
      }
    }
  }

  get totalPages(): number {
    if (!this.pageSize || this.pageSize <= 0) return 0;
    const tr = (this.totalRecords ?? 0);
    const pages = Math.ceil(tr / this.pageSize);
    // if backend didn't provide totalRecords but we have data, show at least one page
    if ((tr === 0 || tr === null) && Array.isArray(this.data) && this.data.length > 0) {
      return 1;
    }
    return Math.max(0, pages);
  }

  get pages(): number[] {
    const tp = this.totalPages;
    return Array.from({ length: tp }, (_, i) => i);
  }

  /**
   * Returns a structured result for a cell so template can render colors/images/text.
   * Result shape: { type: 'text'|'color'|'images'|'boolean', value: any }
   */
 getCell(row: any, field: string) {
  if (!row || !field) return { type: 'text', value: '' };

  const val = row[field];

  // LOGO
  if (field === 'logo') {
    return { type: 'logo', value: val || '/assets/image/no-image.png' };
  }

  // SWITCH FIELD (isActive)
  if (field === 'isactive' || field.toLowerCase() === 'isactive') {
    return { type: 'switch', value: !!val };
  }

  // COLOR HEX
  if (typeof val === 'string' && /^#([A-F0-9]{3}|[A-F0-9]{6})$/i.test(val)) {
    return { type: 'color', value: val };
  }

  // IMAGES ARRAY OR STRING
  if (Array.isArray(val) && val.some(v => this.isUrl(v))) {
    return { type: 'images', value: val };
  }

  if (typeof val === 'string' && this.isUrl(val)) {
    return { type: 'images', value: [val] };
  }

  // BOOLEAN
  if (typeof val === 'boolean') {
    return { type: 'boolean', value: val };
  }

  // Default text
  return { type: 'text', value: val ?? '' };
}

isUrl(v: any) {
  return typeof v === 'string' && /^(https?:\/\/|\/|data:)/i.test(v);
}


  // Fallback handler for broken images: replace with local placeholder
  onImgError(event: Event) {
    const img = event.target as HTMLImageElement;
    if (!img) return;
    // avoid infinite loop if placeholder cannot be found
    img.onerror = null;
    img.src = this.NoImagePath;
  }

  onToggle(row: any, event: any) {
  this.toggleActive.emit({
    row,
    isActive: event.target.checked
  });
}

}