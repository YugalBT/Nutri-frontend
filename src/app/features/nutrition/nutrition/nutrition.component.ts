import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FarmListComponent } from '../../farm/farm-list/farm-list.component';
import { AnimalGroupListComponent } from '../../animal-group/animal-group-list/animal-group-list.component';
import { FeedListComponent } from '../../feed/feed-list/feed-list.component';
import { RationListComponent } from '../../ration/ration-list/ration-list.component';
import { FarmService } from '../../../core/services/farm/farm.service';

@Component({
  selector: 'app-nutrition',
  standalone: true,
  imports: [
    CommonModule,
    FarmListComponent,
    AnimalGroupListComponent,
    FeedListComponent,
    RationListComponent,
  ],
  templateUrl: './nutrition.component.html',
  styleUrl: './nutrition.component.css',
})
export class NutritionComponent implements OnInit {
  activeTab: string = 'animalGroup';
  farmId!: string;
  farm: any;
  loading = false;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private farmService: FarmService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.activeTab = params['tab'] || 'animalGroup';

      this.farmId = params['farmId'];

      if (this.farmId) {
        this.getFarmDetailsBySearch();
      }
    });
  }

  getFarmDetailsBySearch(): void {
    this.loading = true;

    const payload = {
      searchValue: this.farmId, 
      recordPerPage: 10000,
    };

    this.farmService.getFarmsDetails(payload).subscribe({
      next: (res) => {
        this.farm = res?.data?.length ? res.data[0] : null;
        this.loading = false;
      },
      error: () => {
        this.farm = null;
        this.loading = false;
      },
    });
  }

  goBack() {
    this.router.navigate(['/farm']);
  }

  setTab(tab: string): void {
    this.activeTab = tab;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab },
      queryParamsHandling: 'merge',
    });
  }
}
