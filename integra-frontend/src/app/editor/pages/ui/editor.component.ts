import { Component } from '@angular/core';
import { DiagramComponent } from '../../components/diagram/diagram.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { DiagramService } from '../../services/diagram.service';

@Component({
  selector: 'integra-editor',
  standalone: true,
  imports: [DiagramComponent, SidebarComponent],
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.scss'
})
export class EditorComponent {
  constructor(private diagramService: DiagramService) {}

  // Undo action
  undo(): void {
    this.diagramService.undo();
  }

  // Redo action
  redo(): void {
    this.diagramService.redo();
  }
}

