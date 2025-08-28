import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { AvatarModule } from 'primeng/avatar';
import { RippleModule } from 'primeng/ripple';
import { TooltipModule } from 'primeng/tooltip';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chat-layout',
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
  templateUrl: './chat-gpt.component.html',
  styleUrls: ['./chat-gpt.component.scss'],
})
export class ChatLayoutComponent {
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
