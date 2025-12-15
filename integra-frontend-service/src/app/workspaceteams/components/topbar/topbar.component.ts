import { Component, signal } from '@angular/core';

@Component({
  standalone: true,
  selector: 'integra-topbar',
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss',
})
export class TopbarComponent {
  query = signal('');
}
