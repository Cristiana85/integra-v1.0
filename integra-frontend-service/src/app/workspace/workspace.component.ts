import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface IntegraWorkspace {
  id: number;
  name: string;
  type: string;
  description?: string;
  updatedAt: Date;
}

@Component({
  selector: 'app-workspace',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './workspace.component.html',
  styleUrls: ['./workspace.component.scss'],
})
export class WorkspaceComponent {
  workspaces: IntegraWorkspace[] = [
    {
      id: 1,
      name: 'RF Frontend 3.7 GHz',
      type: 'RF / S-Params',
      description: 'Progetto di test per S-parameters + EM 2.5D',
      updatedAt: new Date(),
    },
    {
      id: 2,
      name: 'Integra Demo Workspace',
      type: 'Demo / UI',
      description: 'Mock UI, netlist parser, playground WebGPU/WASM',
      updatedAt: new Date(),
    },
  ];

  selected: IntegraWorkspace | null = this.workspaces[0] ?? null;

  renamingId: number | null = null;
  renameValue = '';
  nextId = 3;

  // mock per il tema – poi lo colleghi al tuo ThemeService
  private _dark = true;

  isDarkTheme(): boolean {
    return this._dark;
  }

  toggleTheme(): void {
    this._dark = !this._dark;
    // qui eventualmente chiami il tuo themeService.toggle()
  }

  newWorkspace(): void {
    const ws: IntegraWorkspace = {
      id: this.nextId++,
      name: `Nuovo workspace ${this.nextId - 1}`,
      type: 'RF / Generic',
      description: '',
      updatedAt: new Date(),
    };

    this.workspaces = [ws, ...this.workspaces];
    this.selected = ws;
    this.renamingId = null;
  }

  selectWorkspace(ws: IntegraWorkspace): void {
    this.selected = ws;
    this.renamingId = null;
  }

  startRename(ws: IntegraWorkspace): void {
    this.renamingId = ws.id;
    this.renameValue = ws.name;
  }

  confirmRename(ws: IntegraWorkspace): void {
    if (this.renamingId !== ws.id) {
      return;
    }

    const value = this.renameValue.trim();
    if (value) {
      ws.name = value;
      ws.updatedAt = new Date();
    }

    this.renamingId = null;
  }

  deleteWorkspace(ws: IntegraWorkspace): void {
    this.workspaces = this.workspaces.filter((w) => w.id !== ws.id);

    if (this.selected?.id === ws.id) {
      this.selected = this.workspaces[0] ?? null;
    }

    if (this.renamingId === ws.id) {
      this.renamingId = null;
    }
  }
}
