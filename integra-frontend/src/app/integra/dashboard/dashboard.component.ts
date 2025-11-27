import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { AvatarModule } from 'primeng/avatar';
import { RippleModule } from 'primeng/ripple';
import { TooltipModule } from 'primeng/tooltip';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'integra-dashboard',
  standalone: true,
  imports: [
    RouterModule,
    ButtonModule,
    DividerModule,
    AvatarModule,
    RippleModule,
    TooltipModule,
    CommonModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent {
  collapsed = false;

  // chiave attiva per evidenziare la voce selezionata
  activeKey:
    | 'chat'
    | 'search'
    | 'library'
    | 'codex'
    | 'sora'
    | 'gpts'
    | 'planetaria'
    | 'protocol'
    | 'tailwind' = 'chat';

  toggleCollapse() {
    this.collapsed = !this.collapsed;
  }
  setActive(key: typeof this.activeKey) {
    this.activeKey = key;
  }
}
