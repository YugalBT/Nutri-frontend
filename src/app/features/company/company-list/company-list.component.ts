import { Component, OnDestroy } from '@angular/core';
import { CompanyAddEditComponent } from '../company-add-edit/company-add-edit.component';
import { ReusableTableComponent } from '../../../shared/components/reusable-table/reusable-table.component';
import { TranslateService } from '../../../i18n/translate.service';
import { TranslatePipe } from '../../../i18n/translate.pipe';
import { CompanyService } from '../../../core/services/company/company.service';
import { CompanyList } from '../../../core/models/company-list';

@Component({
  selector: 'app-company-list',
  standalone: true,
  imports: [CompanyAddEditComponent,ReusableTableComponent, TranslatePipe],
  templateUrl: './company-list.component.html',
  styleUrls: ['./company-list.component.css']
})
export class CompanyListComponent implements OnDestroy {
  columns: string[] = [];
  companies: CompanyList[] = [];
  private langSub: any;

  constructor(private translate: TranslateService, private companyService: CompanyService) {
    this.setColumns();
    this.langSub = this.translate.lang$.subscribe(() => this.setColumns());
  }

  private setColumns() {
    this.columns = [
      this.translate.instant('company.columns.logo') || 'Logo',
      this.translate.instant('company.columns.siteColor') || 'Site Color',
      this.translate.instant('company.columns.companyName') || 'Company Name',
      this.translate.instant('company.columns.name') || 'Name',
      this.translate.instant('company.columns.email') || 'Email',
      this.translate.instant('company.columns.phone') || 'Phone Number',
      this.translate.instant('company.columns.code') || 'Code',
      this.translate.instant('company.columns.status') || 'Status',
      this.translate.instant('company.columns.actions') || 'Actions'
    ];
  }

  ngOnDestroy(): void {
    this.langSub.unsubscribe();
  }

ngOnInit(): void {
  this.getAllCompanies();
}

getAllCompanies() {
  this.companyService.getAllCompanies().subscribe({
    next: (res) => {
      this.companies = res.data as CompanyList[]; 
    },
    error: (err) => {
      console.error('Error fetching companies:', err);
    }
  });
}



  deleteCompany(row: any) {
  if (confirm(`Are you sure you want to delete ${row.name}?`)) {
    this.companyService.deleteCompany(row.tenantId).subscribe({
      next: () => alert('Company deleted successfully'),
      error: () => alert('Failed to delete company')
    });
  }
}

toggleCompanyStatus(row: any) {
  this.companyService.ativeInactiveCompanyStatus(row.tenantId, !row.isActive).subscribe({
    next: () => row.isActive = !row.isActive, // update local state
    error: () => alert('Failed to update status')
  });
}

}
