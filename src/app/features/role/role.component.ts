import { Component } from '@angular/core';
import { ReusableTableComponent } from '../../shared/components/reusable-table/reusable-table.component';
import { RoleAddEditComponent } from './role-add-edit/role-add-edit.component';
import { TranslateService } from '../../i18n/translate.service';
import { TranslatePipe } from '../../i18n/translate.pipe';
import { GlobalSearchComponent } from '../../shared/components/global-search/global-search.component';

@Component({
  selector: 'app-role',
  standalone: true,
  imports: [ReusableTableComponent,RoleAddEditComponent,TranslatePipe, GlobalSearchComponent],
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.css']
})
export class RoleComponent {
roles = [
  { company: 'Example Corp', name: 'Admin', description: 'Full System Access', active: 'Yes' },
  { company: 'Example Corp', name: 'User', description: 'Limited Access', active: 'No' }
];
totalRecords = 0;
  pageSize = 5;
  pageIndex = 0;

  searchValue = '';
  filterStatus: number | null = null;
  // ------------------------------------
  onSearch(value: string) {    // 🔥 FIX 2: Strict string input
    this.searchValue = value;

    // if (this.searchDebounce) clearTimeout(this.searchDebounce);

    // this.searchDebounce = setTimeout(() => {
    //   this.pageIndex = 0;
    //  // this.loadCompanies(1, this.pageSize);
    // }, 400);
  }
 clearFilters() {
    this.searchValue = '';
    this.filterStatus = null;
    this.pageIndex = 0;
    //this.loadCompanies(1, this.pageSize);
  }

}
