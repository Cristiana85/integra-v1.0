import { Component } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { TabViewModule } from 'primeng/tabview';
import { SharedModule } from 'src/app/shared/shared.module';
import { SearchComponent } from "../../shared/components/search/search.component";

@Component({
  selector: 'app-workspace',
  standalone: true,
  imports: [
    SharedModule,
    TabViewModule,
    RouterModule,
    SearchComponent
  ],
  templateUrl: './workspace.component.html',
  styleUrl: './workspace.component.scss'
})
export class WorkspaceComponent {

  items: MenuItem[];

  ngOnInit() {
    this.items = [
      { label: 'Add New', icon: 'pi pi-fw pi-plus' },
      { label: 'Remove', icon: 'pi pi-fw pi-minus' }
    ];
  }
}
