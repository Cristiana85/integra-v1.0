import { Component, EventEmitter, Output, signal } from '@angular/core';

@Component({
  standalone: true,
  selector: 'integra-composer',
  templateUrl: './composer.component.html',
  styleUrl: './composer.component.scss',
})
export class ComposerComponent {
  @Output() send = new EventEmitter<string>();
  value = signal('');

  submit() {
    const v = this.value();
    this.send.emit(v);
    this.value.set('');
  }

  onKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      this.submit();
    }
  }
}
