import { Component } from '@angular/core';
import { TabViewModule } from 'primeng/tabview';
import { SharedModule } from 'src/app/shared/shared.module';

@Component({
  selector: 'app-workspace',
  standalone: true,
  imports: [SharedModule, TabViewModule],
  templateUrl: './workspace.component.html',
  styleUrl: './workspace.component.scss'
})
export class WorkspaceComponent {

}
