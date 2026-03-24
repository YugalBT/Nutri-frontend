import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AnimalGroupListComponent } from '../../animal-group/animal-group-list/animal-group-list.component';
import { FeedListComponent } from '../../feed/feed-list/feed-list.component';
import { RationListComponent } from '../../ration/ration-list/ration-list.component';

@Component({
  selector: 'app-nutrition',
  standalone: true,
  imports: [
    CommonModule,
    AnimalGroupListComponent,
    FeedListComponent,
    RationListComponent,
  ],
  templateUrl: './nutrition.component.html',
  styleUrl: './nutrition.component.css',
})
export class NutritionComponent implements OnInit {
  activeTab: string = 'animalGroup';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.activeTab = params['tab'] || 'animalGroup';
    });
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
