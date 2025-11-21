import { Component } from '@angular/core';
import { ReusableTableComponent } from '../../shared/components/reusable-table/reusable-table.component';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [ReusableTableComponent],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent {

   columns: string[] = [
    'Title',
    'Description',
    'Create Date'
  ];

  notificationsData = [
    { title: 'Tenant', description: 'Tenant Pichai created.', date: '11-12-2025' },
    { title: 'Estimate', description: 'Estimate Created.', date: '10-01-2025' },
    { title: 'Tenant', description: 'Tenant profile updated.', date: '10-10-2025' },
    { title: 'Tenant', description: 'GHL User Created.', date: '07-09-2025' },
    { title: 'Estimate', description: 'Estimate Created.', date: '08-04-2025' },
    { title: 'Tenant', description: 'Tester GHL Tenant Created.', date: '07-05-2025' },
  ];
}
