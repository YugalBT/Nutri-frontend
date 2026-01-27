import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReusableTableComponent } from '../../../shared/components/reusable-table/reusable-table.component';
import { RationService } from '../../../core/services/ration/ration.service';
import { ROUTE_CONST } from '../../../core/constants/route.constants';

@Component({
  selector: 'app-ration-items',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReusableTableComponent
  ],
  templateUrl: './ration-items.component.html',
  styleUrl: './ration-items.component.css'
})
export class RationItemsComponent implements OnInit {

  rationId!: string;
  rationName!: string;
  farmId!: string;

  items: any[] = [];
  totalRecords = 0;

  columns = ['Feed Name', 'Per Kg', 'Dry Matter', 'Protein'];
  columnFields = ['feedName', 'perKg', 'dryMatter', 'protein'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private rationService: RationService
  ) { }

  ngOnInit(): void {
this.route.queryParams.subscribe(params => {
    this.rationId = params['rationId'];
    this.farmId = params['farmId']; 

    if (!this.rationId) {
      this.goBack();
      return;
    }

    this.loadRationItems();
  });
  }

  loadRationItems(): void {
    this.rationService.getRationItems(this.rationId)
      .subscribe({
        next: (res) => {

          this.items = res?.data?.items ?? [];
          this.rationName = res?.data?.rationName ?? '';
          this.totalRecords = this.items.length;
        },
        error: () => {
          this.items = [];
          this.totalRecords = 0;
        }
      });
  }


  goBack(): void {
    this.router.navigate(['/nutrition'], {
    queryParams: {
      farmId: this.farmId,
      tab: 'ration'
    }
  });
  }

}
