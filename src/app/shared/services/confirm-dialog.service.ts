import { ApplicationRef, ComponentRef, createComponent, Injectable, Injector } from '@angular/core';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { Observable, Subject } from 'rxjs';

declare var bootstrap: any;

@Injectable({
  providedIn: 'root'
})
export class ConfirmDialogService {

 constructor(private appRef: ApplicationRef, private injector: Injector) {}

  confirm(message: string): Observable<boolean> {
    const subject = new Subject<boolean>();

    const componentRef: ComponentRef<ConfirmDialogComponent> = createComponent(ConfirmDialogComponent, {
      environmentInjector: this.appRef.injector
    });

    componentRef.instance.show(message);

    const sub = componentRef.instance.confirm.subscribe(result => {
      subject.next(result);
      subject.complete();
      sub.unsubscribe();
      componentRef.destroy();
    });

    this.appRef.attachView(componentRef.hostView);
    document.body.appendChild((componentRef.hostView as any).rootNodes[0]);

    return subject.asObservable();
  }
}
