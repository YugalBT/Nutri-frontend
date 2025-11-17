import { Directive } from '@angular/core';

@Directive({
  selector: '[appHasPermission]',
  standalone: true
})
export class HasPermissionDirective {

  constructor() { }

}
