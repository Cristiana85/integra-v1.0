import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'integra-toolbar',
  standalone: true,
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent {
  @Output() undoAction = new EventEmitter<void>();
  @Output() redoAction = new EventEmitter<void>();

  // Emit events for undo/redo
  undo(): void {
    this.undoAction.emit();
  }

  redo(): void {
    this.redoAction.emit();
  }
}
