import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

interface WorkspaceItem {
  id: string;
  name: string;
  description?: string;
  updatedAt: string;
  createdAt: string;
  type: 's-param' | 'transient' | 'hb' | 'em2d' | 'generic';
}

const STORAGE_KEY = 'integra-workspaces';

@Component({
  selector: 'app-workspace',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './workspace.component.html',
  styleUrl: './workspace.component.scss',
})
export class WorkspaceComponent implements OnInit {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  workspaces: WorkspaceItem[] = [];
  selected: WorkspaceItem | null = null;
  renamingId: string | null = null;
  renameValue = '';

  ngOnInit(): void {
    this.loadFromStorage();

    // se è vuoto, crea qualche demo
    if (this.workspaces.length === 0) {
      this.seedDemoData();
    }

    this.selected = this.workspaces[0] ?? null;
  }

  private loadFromStorage(): void {
    if (!this.isBrowser) return; // 👈 su server non fare nulla

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        this.workspaces = JSON.parse(raw);
      }
    } catch (e) {
      console.error('Errore caricando i workspace da localStorage', e);
    }
  }

  private saveToStorage(): void {
    if (!this.isBrowser) return; // 👈 idem

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.workspaces));
    } catch (e) {
      console.error('Errore salvando i workspace su localStorage', e);
    }
  }

  private seedDemoData(): void {
    if (!this.isBrowser) {
      // lato server: crea solo in memoria se proprio vuoi mostrare qualcosa
      const now = new Date().toISOString();
      this.workspaces = [
        {
          id: 'ws-1',
          name: 'Linee IBIS – DDR4 demo',
          description: 'Simulatore SI IBIS per canale DDR4',
          createdAt: now,
          updatedAt: now,
          type: 'transient',
        },
      ];
      return;
    }

    const now = new Date().toISOString();
    this.workspaces = [
      {
        id: 'ws-1',
        name: 'Linee IBIS – DDR4 demo',
        description: 'Simulatore SI IBIS per canale DDR4',
        createdAt: now,
        updatedAt: now,
        type: 'transient',
      },
      {
        id: 'ws-2',
        name: 'Filtro RF 4 bande ADRV9044',
        description: 'S-parametri e ottimizzazione matching',
        createdAt: now,
        updatedAt: now,
        type: 's-param',
      },
      {
        id: 'ws-3',
        name: 'EM 2.5D – microstrip coupler',
        description: 'Analisi EM 2.5D di un directional coupler',
        createdAt: now,
        updatedAt: now,
        type: 'em2d',
      },
    ];
    this.saveToStorage();
  }

  selectWorkspace(ws: WorkspaceItem): void {
    this.selected = ws;
  }

  newWorkspace(): void {
    const now = new Date().toISOString();
    const ws: WorkspaceItem = {
      id:
        'ws-' +
        (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString()),
      name: 'Nuovo workspace',
      description: 'Workspace vuoto',
      createdAt: now,
      updatedAt: now,
      type: 'generic',
    };
    this.workspaces = [ws, ...this.workspaces];
    this.selected = ws;
    this.saveToStorage();
  }

  startRename(ws: WorkspaceItem): void {
    this.renamingId = ws.id;
    this.renameValue = ws.name;
  }

  confirmRename(ws: WorkspaceItem): void {
    const trimmed = this.renameValue.trim();
    if (!trimmed) {
      this.cancelRename();
      return;
    }
    ws.name = trimmed;
    ws.updatedAt = new Date().toISOString();
    this.saveToStorage();
    this.cancelRename();
  }

  cancelRename(): void {
    this.renamingId = null;
    this.renameValue = '';
  }

  deleteWorkspace(ws: WorkspaceItem): void {
    if (!confirm(`Eliminare il workspace "${ws.name}"?`)) {
      return;
    }
    this.workspaces = this.workspaces.filter((w) => w.id !== ws.id);
    if (this.selected?.id === ws.id) {
      this.selected = this.workspaces[0] ?? null;
    }
    this.saveToStorage();
  }
}
