import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReusableTableComponent } from '../../shared/components/reusable-table/reusable-table.component';
import { NotificationService } from '../../core/services/notification/notification.service';
import { NotificationList } from '../../core/models/notification-list';
import { GlobalSearchComponent } from '../../shared/components/global-search/global-search.component';
import { CommonService } from '../../shared/services/common.service';
import { PERMISSIONS } from '../../core/constants/permissions.constants';
import { TranslatePipe } from '../../i18n/translate.pipe';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, FormsModule, ReusableTableComponent, GlobalSearchComponent,TranslatePipe],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit {

  columns: string[] = ['Title', 'Description', 'Create Date', 'Type'];
  columnFields: string[] = ['title', 'description', 'createdDate', 'type']; // for reusable table
  notificationsData: any[] = [];
  filteredData: any[] = [];
  loading = false;

  constructor(private notificationService: NotificationService,private commonService : CommonService) { }

  ngOnInit(): void {
    
    if(!this.commonService.checkPermission(PERMISSIONS.Notificaton))
        return;
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.loading = true;
    this.notificationService.getNotificationList().subscribe({
      next: (res) => {
        if (res.isSuccess && Array.isArray(res.data)) {
          this.notificationsData = res.data.map((n: NotificationList) => ({
            title: n.subject,
            description: n.body,
            createdDate: n.createdDate ? new Date(n.createdDate).toLocaleDateString() : '',
            type: n.type
          }));
        } else {
          this.notificationsData = [];
        }
        this.filteredData = [...this.notificationsData];
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching notifications:', err);
        this.loading = false;
      }
    });
  }

  onSearch(searchText: string): void {
    const search = searchText.toLowerCase();
    if (!search) {
      this.filteredData = [...this.notificationsData];
    } else {
      this.filteredData = this.notificationsData.filter(n =>
        Object.values(n).some(val => val?.toString().toLowerCase().includes(search))
      );
    }
  }

  clearFilters(): void {
    this.filteredData = [...this.notificationsData];
  }
}
