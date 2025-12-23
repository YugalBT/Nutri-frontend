import { Component } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { ManagePlaceholderMappingComponent } from './manage-placeholder-mapping/manage-placeholder-mapping.component';
import { ManagePlaceholdersComponent } from './manage-placeholders/manage-placeholders.component';
import { TemplateCategoryListComponent } from './template-category/template-category-list/template-category-list.component';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '../../i18n/translate.pipe';

@Component({
  selector: 'app-template-builder',
  standalone: true,
  imports: [SharedModule,TemplateCategoryListComponent,ManagePlaceholderMappingComponent,ManagePlaceholdersComponent,TranslatePipe],
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
