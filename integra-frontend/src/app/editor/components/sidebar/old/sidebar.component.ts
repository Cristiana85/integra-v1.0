import { Component } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { AccordionModule } from 'primeng/accordion';
import { CommonModule } from '@angular/common';
import { TabViewModule } from 'primeng/tabview';

@Component({
  selector: 'integra-sidebar',
  standalone: true,
  imports: [SharedModule, AccordionModule, CommonModule, TabViewModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
  activeTab: string = 'interactive'; // Default active tab

  lineCharts = [
    { label: 'Baseline Chart', image: 'assets/icons/placeholder.jpg' },
    { label: 'Smooth Baseline Chart', image: 'assets/icons/placeholder.jpg' },
    { label: 'Baseline Chart', image: 'assets/icons/placeholder.jpg' },
    { label: 'Smooth Baseline Chart', image: 'assets/icons/placeholder.jpg' },
  ];

  barCharts = [
    { label: 'Background Color Bar', image: 'assets/icons/placeholder.jpg' },
    { label: 'Vertical Stacked Bar', image: 'assets/icons/placeholder.jpg' },
  ];

  pieCharts = [
    { label: 'Pie Chart with Rings', image: 'assets/icons/placeholder.jpg' },
    { label: 'Half Pie Chart', image: 'assets/icons/placeholder.jpg' },
  ];

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }
}
