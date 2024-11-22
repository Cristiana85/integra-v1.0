import { Component } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';

@Component({
  selector: 'integra-sidebar',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
  selectedLayout: string = 'layout1';
  selectedTheme: string = 'theme1';

  layouts = [
    { id: 'layout1', icon: 'pi pi-sitemap' },
    { id: 'layout2', icon: 'pi pi-table' },
    { id: 'layout3', icon: 'pi pi-ellipsis-h' },
    { id: 'layout4', icon: 'pi pi-diagram' },
    { id: 'layout5', icon: 'pi pi-flow' },
  ];

  themes = [
    { id: 'theme1', image: 'assets/icons/placeholder.jpg', label: 'Theme 1', isPro: false },
    { id: 'theme2', image: 'assets/icons/placeholder.jpg', label: 'Theme 2', isPro: false },
    { id: 'theme3', image: 'assets/icons/placeholder.jpg', label: 'Theme 3', isPro: false },
    { id: 'theme4', image: 'assets/icons/placeholder.jpg', label: 'Theme 4', isPro: true },
    { id: 'theme5', image: 'assets/icons/placeholder.jpg', label: 'Theme 5', isPro: true },
  ];

  selectLayout(id: string): void {
    this.selectedLayout = id;
  }

  selectTheme(id: string): void {
    this.selectedTheme = id;
  }
}



