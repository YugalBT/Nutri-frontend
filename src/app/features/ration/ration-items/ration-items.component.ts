import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Subscription } from 'rxjs';
import { RationService } from '../../../core/services/ration/ration.service';
import { HttpService } from '../../../shared/services/http.service';
import { API_ENDPOINTS } from '../../../core/constants/api-endpoints';

interface ColumnDef {
  key: string;
  label: string;
}

@Component({
  selector: 'app-ration-items',
  standalone: true,
  imports: [CommonModule, RouterModule, DragDropModule],
  templateUrl: './ration-items.component.html',
  styleUrl: './ration-items.component.css'
})
export class RationItemsComponent implements OnInit, OnDestroy {

  rationId!: string;
  rationName!: string;
  farmId!: string;

  items: any[] = [];
  totalRecords = 0;

  readonly PAGE_NAME = 'ration-items';

  allColumns: ColumnDef[] = [
    { key: 'feedName',    label: 'Feed Name'      },
    { key: 'perKg',       label: 'kg / cow / day'  },
    { key: 'dryMatter',   label: 'Dry Matter (%)'  },
    { key: 'pricePerKg',  label: 'Price / kg (€)'  },
    { key: 'category',    label: 'Category'        },
    // Commented out: not exposed in the Feed add/edit form UI
    // { key: 'protein',  label: 'Protein (%)'  },
    // { key: 'starch',   label: 'Starch (%)'   },
    // { key: 'fat',      label: 'Fat (%)'      },
    // { key: 'ndf',      label: 'NDF (%)'      },
  ];

  columns: ColumnDef[] = [...this.allColumns];

  private subs: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private rationService: RationService,
    private http: HttpService,
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.rationId = params['rationId'];
      this.farmId   = params['farmId'];

      if (!this.rationId) { this.goBack(); return; }

      this.loadLayout();
      this.loadRationItems();
    });
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  // ─── Data ──────────────────────────────────────────────────────────────────

  loadRationItems(): void {
    const sub = this.rationService.getRationItems(this.rationId).subscribe({
      next: (res) => {
        this.items       = res?.data?.items ?? [];
        this.rationName  = res?.data?.rationName ?? '';
        this.totalRecords = this.items.length;
      },
      error: () => { this.items = []; this.totalRecords = 0; }
    });
    this.subs.push(sub);
  }

  // ─── Column drag-drop ──────────────────────────────────────────────────────

  onColumnDrop(event: CdkDragDrop<ColumnDef[]>): void {
    moveItemInArray(this.columns, event.previousIndex, event.currentIndex);
    this.saveLayout();
  }

  getCellValue(item: any, key: string): any {
    const val = item[key];
    if (val === null || val === undefined || val === '') return '-';
    return val;
  }

  // ─── Layout persistence ────────────────────────────────────────────────────

  private loadLayout(): void {
    const url = `${API_ENDPOINTS.DRAG_AND_DROP.GET}?pageName=${this.PAGE_NAME}`;
    const sub = this.http.get<any>(url).subscribe({
      next: (res) => {
        try {
          const order: string[] = JSON.parse(res?.data ?? '[]');
          if (Array.isArray(order) && order.length > 0) {
            const ordered = order
              .map(k => this.allColumns.find(c => c.key === k))
              .filter((c): c is ColumnDef => !!c);

            // Append any new columns not yet in saved layout
            const saved = new Set(order);
            const extras = this.allColumns.filter(c => !saved.has(c.key));
            this.columns = [...ordered, ...extras];
          }
        } catch { /* use defaults */ }
      },
      error: () => { /* use defaults */ }
    });
    this.subs.push(sub);
  }

  private saveLayout(): void {
    const payload = {
      pageName:   this.PAGE_NAME,
      layoutJson: JSON.stringify(this.columns.map(c => c.key)),
    };
    this.http.post<any>(API_ENDPOINTS.DRAG_AND_DROP.SAVE, payload).subscribe();
  }

  // ─── Navigation ────────────────────────────────────────────────────────────

  goBack(): void {
    this.router.navigate(['/ration']);
  }
}
