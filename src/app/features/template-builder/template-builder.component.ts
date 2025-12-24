import { Component } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { TemplateCategoryListComponent } from './template-category/template-category-list/template-category-list.component';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '../../i18n/translate.pipe';
import { TemplatePlaceholderListComponent } from './manage-placeholders/placeholder-list/placeholder-list.component';
import { PlaceholderMappingListComponent } from "./manage-placeholder-mapping/placeholder-mapping-list/placeholder-mapping-list.component";

@Component({
  selector: 'app-template-builder',
  standalone: true,
  imports: [SharedModule, TemplateCategoryListComponent, PlaceholderMappingListComponent, TemplatePlaceholderListComponent, TranslatePipe, PlaceholderMappingListComponent],
  templateUrl: './template-builder.component.html',
  styleUrl: './template-builder.component.css'
})
export class TemplateBuilderComponent {
  activeTab = 'category';

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.activeTab = params['tab'] || 'category';
    });
  }

  setTab(tab: string): void {
    this.activeTab = tab;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab },
      queryParamsHandling: 'merge'
    });
  }
}
