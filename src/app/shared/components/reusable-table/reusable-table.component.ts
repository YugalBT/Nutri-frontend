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

  formatCell(row: any, field: string) {
    if (!row) return '';
    if (!field) return '';
    // Do not invent synthetic fields here; use backend-provided keys.
    const val = row[field];
    if (typeof val === 'boolean') {
      return val ? 'Active' : 'Inactive';
    }
    return val ?? '';
  }
}
