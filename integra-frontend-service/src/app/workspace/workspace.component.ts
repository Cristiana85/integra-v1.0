import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ThemeService } from '../shared/services/core/theme.service';

interface WorkspaceItem {
  id: string;
  name: string;
  type: string;
  description?: string;
  updatedAt: string | Date;
}

@Component({
  selector: 'integra-workspace',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './workspace.component.html',
  styleUrls: ['./workspace.component.scss'],
})
export class WorkspaceComponent {
  workspaces: WorkspaceItem[] = [];
  selected: WorkspaceItem | null = null;

  renamingId: string | null = null;
  renameValue = '';

  constructor(public theme: ThemeService) {
    // TODO: popola workspaces come facevi prima
  }

  /* ======= THEME ======= */

  // usato nel template: [attr.aria-label] e *ngIf
  isDarkTheme(): boolean {
    return !this.theme.isLight;
  }

  toggleTheme(): void {
    this.theme.toggleTheme();
  }

  /* ======= WORKSPACE LOGIC ======= */

  newWorkspace(): void {
    // la tua logica
  }

  selectWorkspace(ws: WorkspaceItem): void {
    this.selected = ws;
  }

  startRename(ws: WorkspaceItem): void {
    this.renamingId = ws.id;
    this.renameValue = ws.name;
  }

  confirmRename(ws: WorkspaceItem): void {
    if (!this.renameValue.trim()) {
      this.renamingId = null;
      return;
    }
    ws.name = this.renameValue.trim();
    this.renamingId = null;
  }

  deleteWorkspace(ws: WorkspaceItem): void {
    this.workspaces = this.workspaces.filter((w) => w !== ws);
    if (this.selected === ws) {
      this.selected = null;
    }
  }
}
