import { Component, OnDestroy } from '@angular/core';
import { ReusableTableComponent } from '../../../shared/components/reusable-table/reusable-table.component';
import { AddeditComponent } from '../addedit/addedit.component';
import { TranslateService } from '../../../i18n/translate.service';
import { TranslatePipe } from '../../../i18n/translate.pipe';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [ReusableTableComponent, AddeditComponent, TranslatePipe],
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent implements OnDestroy {
    columns: string[] = [];
    private langSub: any;

   constructor(private translate: TranslateService) {
     this.setColumns();
     this.langSub = this.translate.lang$.subscribe(() => this.setColumns());
   }

 private setColumns() {
   this.columns = [
     this.translate.instant('users.columns.name') || 'Name',
     this.translate.instant('users.columns.email') || 'Email',
     this.translate.instant('users.columns.phone') || 'Phone Number',
     this.translate.instant('users.columns.ghlUser') || 'GHL User Name',
     this.translate.instant('users.columns.role') || 'Role Name',
     this.translate.instant('users.columns.status') || 'Status',
     this.translate.instant('users.columns.actions') || 'Actions'
   ];
 }

 ngOnDestroy(): void {
   this.langSub.unsubscribe();
 }

}
