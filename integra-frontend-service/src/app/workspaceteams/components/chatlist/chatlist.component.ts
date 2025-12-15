import { Component } from '@angular/core';
import { NgFor, NgClass } from '@angular/common'; // ✅
import { WorkspaceState } from '../../workspace.state'; // o il tuo path

@Component({
  selector: 'integra-chat-list',
  standalone: true,
  imports: [NgFor], // ✅
  templateUrl: './chatlist.component.html',
  styleUrls: ['./chatlist.component.scss'],
})
export class ChatlistComponent {
  constructor(public state: WorkspaceState) {}
}
