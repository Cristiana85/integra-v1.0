import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgClass, NgIf } from '@angular/common';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NgClass, NgIf, ButtonModule],
    template: `
    <div class="h-screen w-screen flex overflow-hidden relative">
      <!-- Toggle sidebar -->
      <button
        pButton
        type="button"
        class="absolute top-3 left-3 z-20"
        [icon]="sidebarOpen() ? 'pi pi-arrow-left' : 'pi pi-bars'"
        (click)="toggleSidebar()">
      </button>

      <!-- Sidebar -->
      <aside
        class="bg-surface-0 border-r border-surface-200 transition-all duration-200 overflow-hidden"
        [class.w-72]="sidebarOpen()" [class.w-0]="!sidebarOpen()">
        <div *ngIf="sidebarOpen()" class="h-full p-3 flex flex-col gap-2">
          <!-- ... tuoi pulsanti ... -->
        </div>
      </aside>

      <!-- Main pane: nota h-full + relative -->
      <main class="flex-1 min-w-0 h-full relative">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
})
export class AppComponent {
  sidebarOpen = signal(true);
  toggleSidebar() { this.sidebarOpen.update(v => !v); }
}
