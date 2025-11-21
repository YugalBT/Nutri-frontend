import { Component } from '@angular/core';
import { ReusableTableComponent } from '../../shared/components/reusable-table/reusable-table.component';
import { RoleAddEditComponent } from './role-add-edit/role-add-edit.component';

@Component({
  selector: 'app-role',
  standalone: true,
  imports: [ReusableTableComponent,RoleAddEditComponent],
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.css']
})
export class RoleComponent {
roles = [
  { company: 'Example Corp', name: 'Admin', description: 'Full System Access', active: 'Yes' },
  { company: 'Example Corp', name: 'User', description: 'Limited Access', active: 'No' }
];

}
