import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SharedModule } from 'src/app/shared/shared.module';

@Component({
  selector: 'integra-add-projects',
  standalone: true,
  imports: [
    SharedModule,
  ],
  templateUrl: './add-projects.component.html',
  styleUrl: './add-projects.component.scss'
})
export class AddProjectsComponent {

  @Input() visible: boolean = false; // Stato di visibilità ricevuto dal genitore
  @Input() project: any = {}; // Oggetto ricevuto dal genitore
  @Output() create = new EventEmitter<any>(); // Evento per restituire il progetto aggiornato
  @Output() close = new EventEmitter<void>();


  /*onClose(): void {
    this.close.emit();
  }

  onCreate(): void {
    this.create.emit(this.project);
    this.onClose(); // Chiude il pop-up
  }

  createProject() {

  }*/

  visible1: boolean = false;

  visible2: boolean = false;

  visible3: boolean = false;

  visible4: boolean = false;

  visible5: boolean = false;

  visible6: boolean = false;

  visible7: boolean = false;

  visible8: boolean = false;

  selectedMember: any = { name: 'Robert Fox', avatar: 'avatar-m-13' };

  members = [
    { name: 'Robert Fox', avatar: 'avatar-m-11' },
    { name: 'John Walter', avatar: 'avatar-m-12' },
    { name: 'Jane Doe', avatar: 'avatar-f-12' }
  ];

  payment: string = 'Visa';

  payment2: string = 'MasterCard';

  checked1: boolean = true;

  checked2: boolean = false;

  checked3: boolean = false;

  checked4: boolean = false;

  ccRegex: RegExp = /[0-9]{4}-[0-9]{4}-[0-9]{4}-[0-9]{4}$/;

  cvc: any;

  expiration: any;

  regexNum: RegExp = /^\d+$/;

  focus(event: KeyboardEvent, input?: HTMLInputElement) {
    let ok = this.regexNum.test(event.key);
    if (ok) {
      input.focus();
    }
    else {
      return;
    }
  }
}
