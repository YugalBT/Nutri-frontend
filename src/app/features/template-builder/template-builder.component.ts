import { Component } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { TemplateCategoryListComponent } from './template-category/template-category-list/template-category-list.component';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '../../i18n/translate.pipe';
import { TemplatePlaceholderListComponent } from './manage-placeholders/placeholder-list/placeholder-list.component';
import { PlaceholderMappingListComponent } from "./manage-placeholder-mapping/placeholder-mapping-list/placeholder-mapping-list.component";
import { TemplateListComponent } from './manage-template/template-list/template-list.component';
import { CommonService } from '../../shared/services/common.service';
import { PERMISSIONS } from '../../core/constants/permissions.constants';

@Component({
  selector: 'app-template-builder',
  standalone: true,
  imports: [SharedModule, TemplateListComponent, TemplateCategoryListComponent, PlaceholderMappingListComponent, TemplatePlaceholderListComponent, TranslatePipe, PlaceholderMappingListComponent],
  templateUrl: './template-builder.component.html',
  styleUrl: './template-builder.component.css'
})
export class TemplateBuilderComponent {
  activeTab = 'category';
  canCategory = false;
  canPlaceholder = false;
  canMapping = false;
  canTemplate = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private commonService : CommonService,
  ) { }

  ngOnInit(): void {

        this.canCategory =
      this.commonService.checkPermission(PERMISSIONS.TemplateCategoryView,false);

    this.canPlaceholder =
      this.commonService.checkPermission(PERMISSIONS.PlaceholderView,false);

    this.canMapping =
      this.commonService.checkPermission(PERMISSIONS.CategoryMappingView,false);

    this.canTemplate =
      this.commonService.checkPermission(PERMISSIONS.TemplateView); 

    this.route.queryParams.subscribe(params => {
       this.activeTab = this.resolveAllowedTab(params['tab']);
    });

  }

    private resolveAllowedTab(tab?: string): string {

    const tabPermissionMap: Record<string, boolean> = {
      category: this.canCategory,
      placeholders: this.canPlaceholder,
      mapping: this.canMapping,
      templates: this.canTemplate
    };

    if (tab && tabPermissionMap[tab]) {
      return tab;
    }

    return Object.keys(tabPermissionMap)
      .find(t => tabPermissionMap[t]) || 'category';
  }

  setTab(tab: string): void {
    const safeTab = this.resolveAllowedTab(tab);
    this.activeTab = tab;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab :safeTab },
      queryParamsHandling: 'merge'
    });
  }
}
