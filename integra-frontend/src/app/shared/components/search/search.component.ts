import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SharedModule } from '../../shared.module';

@Component({
  selector: 'integra-search',
  standalone: true,
  imports: [
    SharedModule
  ],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss'
})

export class SearchComponent {
  @Input() searchQuery: string = ''; // Valore iniziale ricevuto dal padre
  @Output() searchQueryChange = new EventEmitter<string>(); // Evento per notificare il padre

  onSearchInput(): void {
    this.searchQueryChange.emit(this.searchQuery); // Emitti il nuovo valore
  }

  onClearSearch(): void {
    this.searchQuery = ''; // Cancella il valore
    this.searchQueryChange.emit(this.searchQuery); // Notifica il padre
  }
}
