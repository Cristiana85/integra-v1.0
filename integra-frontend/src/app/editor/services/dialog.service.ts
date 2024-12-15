import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  private showDialogSubject = new BehaviorSubject<boolean>(false);
  showDialog$ = this.showDialogSubject.asObservable();

  openDialog() {
    this.showDialogSubject.next(true);
  }

  closeDialog() {
    this.showDialogSubject.next(false);
  }
}
