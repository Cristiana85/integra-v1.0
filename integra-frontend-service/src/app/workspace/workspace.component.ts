import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface WorkspaceItem {
  id: string;
  name: string;
  description?: string;
  updatedAt: string;
  type: 's-param' | 'transient' | 'hb' | 'em2d' | 'generic';
}

@Component({
  selector: 'app-workspace',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './workspace.component.html',
  styleUrl: './workspace.component.scss',
})
export class WorkspaceComponent {
  // mock iniziale: poi li caricherai da backend / localStorage
  workspaces: WorkspaceItem[] = [
    {
      id: 'ws-1',
      name: 'Linee IBIS – DDR4 demo',
      description: 'Simulatore SI IBIS per canale DDR4',
      updatedAt: '2025-11-27 09:30',
      type: 'transient',
    },
    {
      id: 'ws-2',
      name: 'Filtro RF 4 bande ADRV9044',
      description: 'S-parametri e ottimizzazione matching',
      updatedAt: '2025-11-26 17:10',
      type: 's-param',
    },
    {
      id: 'ws-3',
      name: 'EM 2.5D – microstrip coupler',
      description: 'Analisi EM 2.5D di un directional coupler',
      updatedAt: '2025-11-20 14:05',
      type: 'em2d',
    },
  ];

  selected: WorkspaceItem | null = this.workspaces[0] ?? null;

  selectWorkspace(ws: WorkspaceItem): void {
    this.selected = ws;
  }

  newWorkspace(): void {
    const now = new Date();
    const ws: WorkspaceItem = {
      id: 'ws-' + (this.workspaces.length + 1),
      name: 'Nuovo workspace',
      description: 'Workspace vuoto',
      updatedAt: now.toISOString().slice(0, 16).replace('T', ' '),
      type: 'generic',
    };
    this.workspaces = [ws, ...this.workspaces];
    this.selected = ws;
  }
}
