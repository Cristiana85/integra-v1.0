import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';

interface UserProfile {
  name?: string;
  surname?: string;
  email: string;
}

interface WorkspaceItem {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  type: string;
}

const USER_KEY = 'integra-user';
const WORKSPACE_KEY = 'integra-workspaces';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss',
})
export class UserComponent implements OnInit {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  user: UserProfile | null = null;
  workspaceCount = 0;

  ngOnInit(): void {
    if (!this.isBrowser) return;

    try {
      const rawUser = localStorage.getItem(USER_KEY);
      if (rawUser) {
        this.user = JSON.parse(rawUser);
      }

      const rawWs = localStorage.getItem(WORKSPACE_KEY);
      if (rawWs) {
        const list: WorkspaceItem[] = JSON.parse(rawWs);
        this.workspaceCount = list.length;
      }
    } catch (e) {
      console.error('Errore caricando dati profilo', e);
    }
  }
}
