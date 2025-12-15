import { Component } from '@angular/core';
import { ChartPanelComponent } from './components/chart/chart-panel.component';
import { DiagramPanelComponent } from './components/diagram-panel/diagram-panel.component';
import { ChatlistComponent } from './components/chatlist/chatlist.component';

@Component({
  standalone: true,
  selector: 'integra-workspace-shell',
  templateUrl: './workspaceteams.component.html',
  styleUrl: './workspaceteams.component.scss',
  imports: [
    // ⬇️ metti qui i tuoi componenti standalone
    ChatlistComponent,
    // JointJsViewComponent,
    DiagramPanelComponent,
    ChartPanelComponent,
  ],
})
export class WorkspaceteamsComponent {
  // Sidebar ChatGPT-like
  sidebarCollapsed = false;

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  // Resize chatlist (sinistra) in percentuale
  leftPct = 30; // chatlist default 30%
  private resizingLeft = false;

  startResize(ev: PointerEvent) {
    this.resizingLeft = true;
    (ev.target as HTMLElement).setPointerCapture(ev.pointerId);

    const body = document.querySelector('.ws-body') as HTMLElement;
    const totalW = body?.getBoundingClientRect().width || window.innerWidth;

    const startX = ev.clientX;
    const startPct = this.leftPct;

    const onMove = (e: PointerEvent) => {
      if (!this.resizingLeft) return;

      const dx = e.clientX - startX;
      const deltaPct = (dx / totalW) * 100;
      const next = startPct + deltaPct;

      // clamp percentuale (mantieni bounds ragionevoli)
      this.leftPct = Math.max(18, Math.min(45, next));
    };

    const onUp = () => {
      this.resizingLeft = false;
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  }

  // Resize verticale nel pannello destro (JointJS sopra / Chart sotto)
  rightTopPct = 70; // 70% jointjs, 30% chart
  private resizingRight = false;

  startRightResize(ev: PointerEvent) {
    this.resizingRight = true;
    (ev.target as HTMLElement).setPointerCapture(ev.pointerId);

    const split = document.querySelector('.right-split') as HTMLElement;
    const totalH = split?.getBoundingClientRect().height || window.innerHeight;

    const startY = ev.clientY;
    const startPct = this.rightTopPct;

    const onMove = (e: PointerEvent) => {
      if (!this.resizingRight) return;

      const dy = e.clientY - startY;
      const deltaPct = (dy / totalH) * 100;
      const next = startPct + deltaPct;

      // clamp
      this.rightTopPct = Math.max(35, Math.min(85, next));
    };

    const onUp = () => {
      this.resizingRight = false;
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  }
}
